document.addEventListener('DOMContentLoaded', () => {
  const copyrightYearElement = document.getElementById('copyrightYear');
  const formInputBookDataElement = document.getElementById('formInputBookData');
  const formSearchBookDataElement = document.getElementById('formSearchBookData');

  const books = [];
  const RENDER_EVENT = 'render-book';

  copyrightYearElement.innerText = new Date().getFullYear();

  formInputBookDataElement.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
    formInputBookDataElement.reset();
  });

  formSearchBookDataElement.addEventListener('submit', (event) => {
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
        addBookToCompleted(bookObject.id);
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

  function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function addBookToUncompletedList(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function removeBookFromList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
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
});
