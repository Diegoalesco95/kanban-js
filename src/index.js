const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');

const itemLists = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

let updatedOnLoad = false;

let draggedItem;
let currentColumn;

let columns = {
  backlog: {
    column: backlogList,
    items: [],
  },
  progress: {
    column: progressList,
    items: [],
  },
  complete: {
    column: completeList,
    items: [],
  },
  onHold: {
    column: onHoldList,
    items: [],
  },
}

function setElementProperties(element, properties) {
  for (let key in properties) {
    element[key] = properties[key];
  }
}

function setElementEventListeners(element, events) {
  for (let event in events) {
    const { eventName, callback } = events[event];
    element.addEventListener(eventName, callback);
  }
}

function removeClass(element, className) {
  element.classList.remove(className);
}

function removeOverClass() {
  Object.values(columns).forEach(({ column }) => {
    removeClass(column, 'over');
  });
}


function drag(event) {
  draggedItem = event.target;
}

function dragEnter(columName) {
  columns[columName].column.classList.add('over');
  currentColumn = columName;
}

function dragOver(event) {
  event.preventDefault();
}

function updateColumns() {
  Object.keys(columns).forEach((column) => {
    columns[column].items = [];
    columns[column].column.querySelectorAll('.drag-item').forEach((item) => {
      columns[column].items.push(item.textContent);
    });
  });
  updateSavedColumns();
}

function drop(e) {
  e.preventDefault();
  removeOverClass();

  const parent = columns[currentColumn].column;
  parent.appendChild(draggedItem);

  updateColumns();
}



function getSavedColumns() {
  Object.keys(columns).forEach((column) => {
    if (localStorage.getItem(column)) {
      columns[column].items = JSON.parse(localStorage.getItem(column));
    } else {
      columns[column].items = [];
    }
  });

  updatedOnLoad = true;
}

function updateSavedColumns() {
  Object.keys(columns).forEach((column) => {
    localStorage.setItem(`${column}`, JSON.stringify(columns[column].items));
  });
}

function setIsEditable(item, isEditable) {
  item.contentEditable = isEditable;
  item.focus();
}

function updateItem(id, column) {
  const selectedColumn = columns[column];
  const selectedColumnEl = selectedColumn.column.children;
  const selectedItem = selectedColumnEl[id];

  if (!selectedItem.textContent) {
    selectedColumn.items.splice(id, 1);
  } else {
    columns[column].items[id] = selectedItem.textContent;
  }
  setIsEditable(selectedItem, false);
  updateDOM();
}

function createItemEl(columnEl, column, item, index) {
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');

  setElementProperties(listEl, {
    draggable: true,
    textContent: item,
    id: index,
  });

  setElementEventListeners(listEl, [
    {
      eventName: 'dragstart',
      callback: drag,
    },
    {
      eventName: 'dblclick',
      callback: (event) => setIsEditable(event.target, true),
    },
    {
      eventName: 'blur',
      callback: () => updateItem(index, column),
    },
  ]);

  columnEl.appendChild(listEl);
}

function updateDOM() {
  if (!updatedOnLoad) {
    getSavedColumns();
  }

  Object.keys(columns).forEach((column) => {
    columns[column].column.textContent = '';
    columns[column].items.forEach((item, index) => {
      createItemEl(columns[column].column, column, item, index);
    });
  });

  updateColumns();

}

function setDragListeners() {
  Object.keys(columns).forEach((column) => {
    setElementEventListeners(columns[column].column, [
      {
        eventName: 'dragenter',
        callback: () => dragEnter(column),
      },
      {
        eventName: 'dragover',
        callback: dragOver,
      },
      {
        eventName: 'drop',
        callback: drop,
      },
    ]);
  });
}

function addToColumn(index) {
  const item = addItems[index];
  const content = addItems[index].textContent;
  Object.values(columns)[index].items.push(content);
  updateDOM();
  item.textContent = '';
}

function toggleAddItem(index, action) {
  addBtns[index].style.visibility = action === 'show' ? 'hidden' : 'visible';
  saveItemBtns[index].style.display = action === 'show' ? 'flex ' : 'none';
  addItemContainers[index].style.display = action === 'show' ? 'flex' : 'none';

  if (action === 'hide') {
    addToColumn(index);
  }
}

function setClickListeners() {
  addBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => toggleAddItem(index, 'show'));
  });

  saveItemBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => toggleAddItem(index, 'hide'));
  });

}

function init() {
  updateDOM();
  setDragListeners();
  setClickListeners();
}

init();