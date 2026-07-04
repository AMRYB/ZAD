const items = document.querySelectorAll('.list');
const indicator = document.querySelector('.indicator');
const activeIcon = document.getElementById('activeIcon');

const icons = [
  'fa-book-open',
  'fa-hands-praying',
  'fa-house',
  'fa-trophy',
  'fa-gear',
];

function moveIndicator(index) {
  const itemWidth = items[0].offsetWidth;

  // رجّع كل الأيقونات والنصوص
  items.forEach((item) => {
    item.querySelector('.icon').classList.remove('opacity-0');
    item.querySelector('.label').classList.remove('opacity-0');
  });

  // حرّك الدايرة
  indicator.style.transform = `translateX(${itemWidth * index}px)`;

  // غيّر أيقونة الدايرة
  activeIcon.className = `fa-solid ${icons[index]} text-white text-[24px]`;

  // خبّي الأيقونة + النص من تحت للـ active
  items[index].querySelector('.icon').classList.add('opacity-0');
  items[index].querySelector('.label').classList.add('opacity-0');
}

// initial
const activeIndex = [...items].findIndex((item) =>
  item.classList.contains('active'),
);
moveIndicator(activeIndex);

items.forEach((item, index) => {
  item.addEventListener('click', () => {
    items.forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
    moveIndicator(index);
  });
});
