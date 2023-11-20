document.addEventListener('DOMContentLoaded', () => {
  const copyrightYearElement = document.getElementById('copyrightYear');
  copyrightYearElement.innerText = new Date().getFullYear();
});
