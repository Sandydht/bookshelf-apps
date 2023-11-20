document.addEventListener('DOMContentLoaded', () => {
  const copyrightYearElement = document.getElementById('copyrightYear');
  const formInputBookDataElement = document.getElementById('formInputBookData');
  const formSearchBookDataElement = document.getElementById('formSearchBookData');
  const inputIsCompletedElement = document.getElementById('inputIsCompleted');
  const bookshelfTypeElement = document.getElementById('bookshelfType');
  const notificationElement = document.getElementById('notification');

  let books = [];
  const RENDER_EVENT = 'render-book';
  const SAVED_EVENT = 'saved-book';
  const STORAGE_KEY = 'BOOKSHELF_APPS';
  let notificationMessage = '';

  bookshelfTypeElement.innerHTML = '<b>Belum selesai dibaca</b>';
  copyrightYearElement.innerText = new Date().getFullYear();

  inputIsCompletedElement.addEventListener('input', () => {
    const inputIsCompletedValue = document.getElementById('inputIsCompleted').checked;

    if (inputIsCompletedValue == true) {
      bookshelfTypeElement.innerHTML = '<b>Selesai dibaca</b>';
    } else {
      bookshelfTypeElement.innerHTML = '<b>Belum selesai dibaca</b>';
    }
  });

  formInputBookDataElement.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
    formInputBookDataElement.reset();
    bookshelfTypeElement.innerHTML = '<b>Belum selesai dibaca</b>';
  });

  formSearchBookDataElement.addEventListener('submit', (event) => {
    const searchTitleValue = document.getElementById('searchTitle').value;

    if (!searchTitleValue) {
      if (isStorageExist()) {
        books = [];
        loadDataFromStorage();
      }
    } else {
      books = books.filter((book) => removeSpaceFromString(book.title).toLowerCase() == removeSpaceFromString(searchTitleValue).toLowerCase());
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    event.preventDefault();
  });

  document.addEventListener(RENDER_EVENT, () => {
    const bookshelfUncompletedListElement = document.getElementById('bookshelfUncompletedList');
    bookshelfUncompletedListElement.innerHTML = '';

    const bookshelfCompletedListElement = document.getElementById('bookshelfCompletedList');
    bookshelfCompletedListElement.innerHTML = '';

    for (const book of books) {
      const bookElement = makeBook(book);
      if (!book.isCompleted) {
        bookshelfUncompletedListElement.append(bookElement);
      } else {
        bookshelfCompletedListElement.append(bookElement);
      }
    }
  });

  document.addEventListener(SAVED_EVENT, () => {
    notificationElement.style.display = 'block';
    notificationElement.innerText = notificationMessage;

    setTimeout(() => {
      notificationElement.style.display = 'none';
    }, 3000);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  function addBook() {
    const inputTitleValue = document.getElementById('inputTitle').value;
    const inputAuthorValue = document.getElementById('inputAuthor').value;
    const inputYearValue = document.getElementById('inputYear').value;
    const inputIsCompletedValue = document.getElementById('inputIsCompleted').checked;

    const generateId = generateID();
    const bookObject = generateBookObject(
      generateId, 
      inputTitleValue,
      inputAuthorValue,
      Number(inputYearValue),
      Boolean(inputIsCompletedValue)
    );
    books.push(bookObject);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    notificationMessage = 'Data buku berhasil di tambahkan';
    saveBookData();
  }

  function generateID() {
    return +new Date();
  }

  function generateBookObject(id, title, author, year, isCompleted) {
    return {
      id,
      title,
      author,
      year,
      isCompleted
    };
  }

  function makeBook(bookObject) {
    const bookshelfItem = document.createElement('div');
    bookshelfItem.classList.add('bookshelf-item');

    const bookshelfItemBody = document.createElement('div');
    bookshelfItemBody.classList.add('bookshelf-item-body');

    const bookshelfItemTitle = document.createElement('p');
    bookshelfItemTitle.classList.add('bookshelf-item-title');
    bookshelfItemTitle.innerText = bookObject.title;

    const bookshelfItemAuthor = document.createElement('p');
    bookshelfItemAuthor.classList.add('bookshelf-item-description');
    bookshelfItemAuthor.innerText = bookObject.author;

    const bookshelfItemYear = document.createElement('p');
    bookshelfItemYear.classList.add('bookshelf-item-description');
    bookshelfItemYear.innerText = bookObject.year;

    bookshelfItemBody.append(bookshelfItemTitle, bookshelfItemAuthor, bookshelfItemYear);

    const bookshelfItemAction = document.createElement('div');
    bookshelfItemAction.classList.add('bookshelf-item-action');

    const bookshelfItemActionButtonSuccess = document.createElement('button');
    bookshelfItemActionButtonSuccess.classList.add('bookshelf-item-action-success');
    bookshelfItemActionButtonSuccess.innerText = bookObject.isCompleted ? 'Belum Selesai Dibaca' : 'Selesai Dibaca';

    if (bookObject.isCompleted) {
      bookshelfItemActionButtonSuccess.addEventListener('click', () => {
        addBookToUncompletedList(bookObject.id);
      });
    } else {
      bookshelfItemActionButtonSuccess.addEventListener('click', () => {
        addBookToCompletedList(bookObject.id);
      });
    }

    const bookshelfItemActionButtonDanger = document.createElement('button');
    bookshelfItemActionButtonDanger.classList.add('bookshelf-item-action-danger');
    bookshelfItemActionButtonDanger.innerText = 'Hapus Buku';

    bookshelfItemActionButtonDanger.addEventListener('click', () => {
      removeBookFromList(bookObject.id);
    });

    bookshelfItemAction.append(bookshelfItemActionButtonSuccess, bookshelfItemActionButtonDanger);

    bookshelfItem.append(bookshelfItemBody, bookshelfItemAction);

    return bookshelfItem;
  }

  function addBookToCompletedList(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    notificationMessage = 'Data buku berhasil di pindah';
    saveBookData();
  }

  function addBookToUncompletedList(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    notificationMessage = 'Data buku berhasil di pindah';
    saveBookData();
  }

  function removeBookFromList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    notificationMessage = 'Data buku berhasil di hapus';
    saveBookData();
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }

    return null;
  }

  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }

    return -1;
  }

  function saveBookData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function isStorageExist() {
    if (typeof (Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }

    return true;
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function removeSpaceFromString(string) {
    return string.replace(/\s/g, '');
};
});
