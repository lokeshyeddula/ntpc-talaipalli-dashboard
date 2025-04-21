document.getElementById('logoutBtn').addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.removeItem('token'); 
    window.location.href = '/';
});
function preventBack() {
    window.history.forward();
}
setTimeout("preventBack()", 0);
window.onunload = function () {
    null
};
// Metric animation (adjusted for new HTML structure)
document.querySelectorAll('.metric-value').forEach(el => {
  const target = +el.dataset.target;
  let count = 0;

  const update = () => {
    const increment = Math.ceil(target / 60);
    count += increment;
    if (count > target) count = target;
    el.textContent = count.toLocaleString();
    if (count < target) requestAnimationFrame(update);
  };

  update();
});

  
 

  // Theme toggle
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeBtn.querySelector('i');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
  });
}

$(document).ready(function () {
  $('#carouselExampleIndicators').carousel({
    interval: 1000,
    pause: 'hover'
  });
});
