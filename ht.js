'use strict';

class SlidoneModel {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  }
  add() {
    this.tasks.push({
      text: 'Add You Text',
      date: this.getTime(),
      done: false
    });
    this.update();
  }
  change(id, task){
		this.tasks[id] = task;
		this.update();
	}
  remove(id) {
    this.tasks.splice(id, 1);
    this.update();
  }
  update() {
    let key = new KeyboardEvent('keydown', {
      bubbles: true, cancelable: true, keyCode: 13
    });
    document.body.dispatchEvent(key);
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  getTime() {
    let date_current = new Date();
    return `${date_current.getHours()}:${date_current.getMinutes() < 10 ? '0' : ''}${date_current.getMinutes()}`;
  }
}

class SlidoneView extends EventTarget {
  constructor() {
    super();
    this.model = new SlidoneModel();
    this.list = document.querySelector('.todo__list');
    this.list.addEventListener('keyup', event => this.onTask(event));
    this.list.addEventListener('click', event => this.onTask(event));
    let date = new Date().toLocaleDateString('de-DE', {
      day : 'numeric',
      month : 'long',
      year : 'numeric'
    }).replace('.', '');
    document.querySelector('.todo__date').innerHTML = date;
  }
  onTask(event) {
    if (event.target.parentNode.querySelector('.todo__name')) {
      let target = event.target.classList[0];
      let task = event.target.parentNode.querySelector('.todo__name');
      let task_id = task.parentNode.id.split('-')[1];
      let task_status = false;
      let task_action = event.target.dataset.action;
      for (let i = 0; i < document.querySelectorAll('.todo__name').length; i++) {
        document.querySelectorAll('.todo__name')[i].style.borderBottom = 'none';
      }
      if (target === 'todo__btn') {
        task.style.color = '#32ab2a';
        task.parentNode.querySelector('.todo__btn').classList.add('todo__btn--done');
        task.parentNode.style.opacity = 0.3;
        task_status = true;
      } else if (target === 'todo__name') {
        task.style.borderBottom = 'solid 1px #e7e7e7';
      } else if (target === 'todo__close') {
        this.dispatchEvent(new CustomEvent('action', {'detail': {'type': event.target.getAttribute('data-action'), 'id': task_id} } ));
      } else {
      }
      if (this.model.tasks[task_id] && task_action !== 'remove') {
        this.dispatchEvent(new CustomEvent('change', {'detail': {'id': task_id, 'task': {'text': task.value, 'date': this.model.tasks[task_id].date, 'done': task_status} } } ));
      }
    }
  }
  render(tasks) {
    if (tasks.length === 0) {
      this.list.innerHTML = '<strong>Congratulations, you just finished all your tasks !</strong>';
    } else {
      this.list.innerHTML = tasks.map((task, i) => {
        return `
          <li id="task-${i}" data-done="${task.done}" class="todo__task">
            <span class="todo__btn todo__btn--default"></span>
            <input type="text" value="${task.text}" placeholder="${task.text}" class="todo__name"/>
            <span class="todo__time">${task.date}</span>
            <button type="button" class="todo__close" data-action="remove">&times;</button>
          </li>
        `;
      }).join('');
    }
  }
}

class SlidoneController extends EventTarget {
  constructor() {
    super();
    let buttons = document.getElementsByTagName('button');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', this.onClick.bind(this));
		}
  }
  onClick(event) {
    this.dispatchEvent(new CustomEvent('action', {'detail': {'type': event.target.getAttribute('data-action')} } ));
  }
}

class Slidone {
  constructor() {
    this.model = new SlidoneModel();
    this.view = new SlidoneView();
    this.controller = new SlidoneController();
    this.controller.addEventListener('action', event => this.onControls(event));
    this.view.addEventListener('action', event => this.onControls(event));
    this.view.addEventListener('change', event => this.onView(event));
    this.render();
  }
  render() {
    this.view.render(this.model.tasks);
  }
  onView(event){
		this.model.change(event.detail.id, event.detail.task);
	}
  onControls(event) {
    switch(event.detail.type) {
	    case 'add':
  			this.model.add();
  			break;
      case 'remove':
        this.model.remove(event.detail.id);
        break;
      default:
        break;
		}
    this.render();
  }
}

class App {
  constructor() {
    let slidone = new Slidone();
  }
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    let app = new App();
  }
}