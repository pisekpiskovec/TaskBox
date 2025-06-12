var ListModal = document.getElementById("add_list_modal");
var TaskModal = document.getElementById("add_task_modal");

var OpenListModalButton = document.getElementById("open_list_modal");
var OpenTaskModalButton = document.getElementById("open_task_modal");

var ListStack = document.getElementById("list-stack");
var TaskStack = document.getElementById("task-stack");

var CloseListModalButton = document.getElementsByClassName("close_modal")[0];
var CloseTaskModalButton = document.getElementsByClassName("close_modal")[1];

OpenListModalButton.onclick = function () {
    ListModal.style.display = "flex";
}

OpenTaskModalButton.onclick = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const list = urlParams.get('list') != null ? urlParams.get('list') : getCookie('lID') ?? '0';
    document.getElementsByName('list')[0].value = list;
    TaskModal.style.display = "flex";
}

CloseListModalButton.onclick = function () {
    document.getElementsByClassName("containbox")[0].style.display = "none";
    ListModal.style.display = "none";
}

CloseTaskModalButton.onclick = function () {
    document.getElementsByClassName("containbox")[1].style.display = "none";
    TaskModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == ListModal) {
        ListModal.style.display = "none";
    }

    if (event.target == TaskModal) {
        TaskModal.style.display = "none";
    }
}

function LandErrorInterface() {
    const error = document.createElement('err');
    error.innerHTML =
        `
        <img src="assets/airplane-landing.svg" alt="Uh oh!" width="470">
        <h1>Uh oh!</h1>
        <h3>Something went wrong...</h3>
        `;
    return error;
}

function ListInterface(data) {
    const listitem = document.createElement('div');
    listitem['className'] = 'box cursor_hand';
    listitem['id'] = data["_id"];
    listitem['innerText'] = data['name'];
    listitem['onclick'] = function () { OpenList(this); };
    return listitem;
}

function TaskInterface(data) {
    const taskitem = document.createElement('div');
    taskitem['className'] = 'box cursor_hand';
    taskitem['id'] = data["_id"];
    taskitem['innerText'] = data['name'];
    taskitem['onclick'] = function () { OpenTask(this, data['_id'], data['name'], data['finished'], data['notes']); };
    if (data['finished']) taskitem.style.textDecoration = 'line-through';
    return taskitem;
}

function OpenList(ListItem) {
    if (!ListItem.classList.contains('selected_box')) {
        fetch('/task/task/get?list=' + ListItem.id, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                refillStack(data);
            })
            .catch(error => {
                console.error('Error getting data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
        try {
            document.getElementById('list_panel').querySelector('.selected_box').classList.remove('selected_box');
        } catch { console.error('Could\'t deselect current list'); }
        document.cookie = 'lID=' + ListItem.id;
        ListItem.classList.add('selected_box');
    } else if (getCookie('lID') != 0) {
        fetch('/task/task/get?list=0', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                refillStack(data);
            })
            .catch(error => {
                console.error('Error getting data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
        document.getElementById('list_panel').querySelector('.selected_box').classList.remove('selected_box');
        document.cookie = 'lID=0';
        document.getElementsByName('AllTasks')[0].classList.add('selected_box');
    }
}

function OpenTask(TaskItem, id, name, finished, notes) {
    if (!TaskItem.classList.contains('selected_box')) {
        new TaskViewInterface(id, name, finished, notes)
        try {
            document.getElementById('lists_tasks').querySelector('.selected_box').classList.remove('selected_box');
        } catch { console.error('Could\'t deselect current task'); }
        document.cookie = 'tID=' + TaskItem.id;
        TaskItem.classList.add('selected_box');
    } else {
        document.getElementById('current_task').innerHTML = '';
        document.getElementById('lists_tasks').querySelector('.selected_box').classList.remove('selected_box');
        document.cookie = 'tID=0';
    }
}

function refillStack(inputdata, stack = 'task') {
    switch (stack) {
        case 'list':
            ListStack.innerHTML = "";
            inputdata.forEach(data => {
                ListStack.appendChild(ListInterface(data));
            });
            break;
        case 'task':
        default:
            TaskStack.innerHTML = "";
            inputdata.forEach(data => {
                TaskStack.appendChild(TaskInterface(data));
            });
            break;
    }
}

document.getElementById('add_list_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/task/list/add', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('List added:', data);
            ListModal.style.display = "none";
            document.getElementById('name').value = '';
            ReloadListList();
        })
        .catch(error => {
            console.error('Error adding list:', error);
            alert('Error adding list. Please try again.');
        });
});

document.getElementById('add_task_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/task/task/add', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Task added:', data);
            TaskModal.style.display = "none";
            document.getElementById('name').value = '';
            ReloadListContent(formData.get('list'));
        })
        .catch(error => {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        });
});

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const list = urlParams.get('list') != null ? urlParams.get('list') : getCookie('lID') ?? '0';
    if (list == '0') {
        document.cookie = 'lID=0';
    }

    // Fetch lists and tasks
    Promise.all([
        fetch('/task/list/get', { method: 'GET' }).then(response => response.json()),
        fetch('/task/task/get?list=' + list, { method: 'GET' }).then(response => response.json()),
    ])
        .then(([listData, taskData]) => {
            refillStack(listData, 'list');
            refillStack(taskData);
            Array.from(document.getElementById('list_panel').querySelectorAll('.box')).find(box => box.id === getCookie('lID')).classList.add('selected_box');
            if (getCookie('tID') != 0)
                Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID')).click();
        })
        .catch(error => {
            console.error('Error getting data:', error);
            TaskStack.innerHTML = "";
            TaskStack.appendChild(LandErrorInterface());
        });
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function ReloadListContent(lID) {
    fetch('/task/task/get?list=' + lID, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            refillStack(data);
        })
        .catch(error => {
            console.error('Error getting data:', error);
            TaskStack.innerHTML = "";
            TaskStack.appendChild(LandErrorInterface());
        });
}

function ReloadListList() {
    fetch('/task/list/get', { method: 'GET' }).then(response => response.json())
        .then(data => {
            refillStack(data, 'list');
        })
        .catch(error => {
            console.error('Error getting data:', error);
            ListStack.innerHTML = "";
            ListStack.appendChild(LandErrorInterface());
        });
}

class TaskViewInterface {
    TaskView = document.getElementById('current_task');
    tID = 0; tName = ''; tFinished = false; tNote = '';
    constructor(id, name, finished, notes) {
        this.TaskView.innerHTML = "";
        this.TaskView.appendChild(this.TaskViewPart_IDholder(id));
        this.TaskView.appendChild(this.TaskViewPart_Nameplate(name, finished));
        this.TaskView.appendChild(this.TaskViewPart_Note(notes));

        this.tID = id;
        this.tName = name;
        this.tFinished = finished;
        this.tNote = notes;
    }

    TaskViewPart_IDholder(id) {
        const item = document.createElement('input');
        item['type'] = 'hidden';
        item['value'] = id;
        return item;
    }

    TaskViewPart_Nameplate(name, finished) {
        const item = document.createElement('div');
        const connector = document.createElement('div');
        const checkbox = document.createElement('input');
        const label = document.createElement('label');

        checkbox['type'] = 'checkbox';
        checkbox['name'] = 'task-finished';
        checkbox['id'] = 'task-finished';
        checkbox['checked'] = finished;
        connector.appendChild(checkbox);

        label['htmlFor'] = 'task-finished';
        label.innerText = name;
        connector.appendChild(label);

        item['className'] = 'box cursor_hand';
        item.appendChild(connector);
        // item['onclick'] = function () { OpenTask(this); };
        if (finished) item.style.textDecoration = 'line-through';
        return item;
    }

    TaskViewPart_Note(note) {
        const item = document.createElement('textarea');
        item['value'] = note;
        item.addEventListener('change', () => {
            this.TaskControl_ChangeNote(item['value'], item);
        });
        item.addEventListener('animationend', () => {
            this.TaskControl_NoteAnimationEnd(item);
        });
        item['placeholder'] = 'Add note';
        return item;
    }
    TaskControl_ChangeNote(NewNote, Object) {
        const params = new URLSearchParams({
            'notes': NewNote,
            'id': this.tID
        });

        fetch('/task/task/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.tNote = NewNote;
                Object.classList.add('textarea_success');
            })
            .catch(error => {
                console.error('Error updating data:', error);
                Object.classList.add('textarea_fail');
            });
    }

    TaskControl_NoteAnimationEnd(Object) {
        if (Object.classList.contains('textarea_fail'))
            Object.classList.remove('textarea_fail');
        if (Object.classList.contains('textarea_success'))
            Object.classList.remove('textarea_success');
    }
}