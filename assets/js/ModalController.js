var ListModal = document.getElementById("add_list_modal");
var TaskModal = document.getElementById("add_task_modal");
var ListEModal = document.getElementById("edit_list_modal");
var TaskEModal = document.getElementById("edit_task_modal");
var SubtaskModal = document.getElementById("add_subtask_modal");

var OpenListModalButton = document.getElementById("open_list_modal");
var OpenTaskModalButton = document.getElementById("open_task_modal");

var ListStack = document.getElementById("list-stack");
var TaskStack = document.getElementById("task-stack");
var TaskView = document.getElementById('current_task');

var CloseListModalButton = document.getElementsByClassName("close_modal")[0];
var CloseTaskModalButton = document.getElementsByClassName("close_modal")[1];
var CloseListEModalButton = document.getElementsByClassName("close_modal")[2];
var CloseTaskEModalButton = document.getElementsByClassName("close_modal")[3];

let notificationManager;

document.addEventListener('DOMContentLoaded', () => {
    notificationManager = new NotificationManager();
});

window.addEventListener('beforeunload', () => {
    if (notificationManager) {
        notificationManager.destroy();
    }
});

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

CloseListEModalButton.onclick = function () {
    document.getElementsByClassName("containbox")[2].style.display = "none";
    ListEModal.style.display = "none";
}

CloseTaskEModalButton.onclick = function () {
    document.getElementsByClassName("containbox")[3].style.display = "none";
    TaskEModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == ListModal) {
        ListModal.style.display = "none";
    }

    if (event.target == TaskModal) {
        TaskModal.style.display = "none";
    }

    if (event.target == ListEModal) {
        ListEModal.style.display = "none";
    }

    if (event.target == TaskEModal) {
        TaskEModal.style.display = "none";
    }

    if (event.target == SubtaskModal) {
        SubtaskModal.style.display = "none";
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
    listitem.addEventListener('contextmenu', e => {
        e.preventDefault();
        document.getElementsByName('id')[0].value = data['_id'];
        ListEModal.style.display = "flex";
    });
    return listitem;
}

function TaskInterface(data) {
    const taskitem = document.createElement('div');
    taskitem['className'] = 'box cursor_hand';
    taskitem['id'] = data["_id"];
    taskitem['innerText'] = data['name'];
    taskitem['title'] = data['name'];
    if (data['finish_date']) {
        taskitem['innerText'] += ' • Due date: ' + new Date(data['finish_date']).toLocaleDateString();
        taskitem['title'] += ', Due date: ' + new Date(data['finish_date']).toLocaleDateString();
    }

    taskitem['onclick'] = function () { OpenTask(this, data['_id'], data['name'], data['finished'], data['list'], data['reminder'], data['finish_date'], data['notes']); };
    taskitem.addEventListener('contextmenu', e => {
        e.preventDefault();
        document.getElementsByName('id')[1].value = data['_id'];
        TaskEModal.style.display = "flex";
    });

    if (data['reminder'] && data['reminder'] !== '0000-00-00 00:00:00') {
        taskitem['innerText'] += ' • 🔔';
        taskitem.title += `, Reminder: ${new Date(data['reminder']).toLocaleString()}`;
    }

    if (data['finished']) taskitem.style.textDecoration = 'line-through';
    return taskitem;
}

function OpenList(ListItem) {
    if (!ListItem.classList.contains('selected_box')) {
        fetch('task/task/get?list=' + ListItem.id, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                refillStack(data);
                if (getCookie('tID') != 0)
                    Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID'))?.click();
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
    } else {
        fetch('task/task/get?list=0', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                refillStack(data);
                if (getCookie('tID') != 0)
                    Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID'))?.click();
            })
            .catch(error => {
                console.error('Error getting data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
        document.getElementById('list_panel').querySelector('.selected_box').classList.remove('selected_box');
        document.cookie = 'lID=0';
        document.getElementsByName('TodaysView')[0].classList.add('selected_box');
    }
}

function OpenTask(TaskItem, id, name, finished, list, reminder, due, notes) {
    if (!TaskItem.classList.contains('selected_box')) {
        new TaskViewInterface(id, name, finished, list, reminder, due, notes);
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
    fetch('task/list/add', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('List added:', data);
            ListModal.style.display = "none";
            document.getElementsByName('name')[0].value = '';
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
    fetch('task/task/add', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Task added:', data);
            TaskModal.style.display = "none";
            document.getElementsByName('name')[1].value = '';
            document.getElementsByName('finish_date')[0].value = '';
            ReloadListContent(formData.get('list'));
        })
        .catch(error => {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        });
});

document.getElementById('edit_list_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    const params = new URLSearchParams({
        'name': formObject['name'],
        'id': formObject['id']
    });

    fetch('task/list/edit', {
        method: 'PUT', body: params.toString(), headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('List added:', data);
            document.getElementsByName('name')[2].value = '';
            ListEModal.style.display = "none";
            ReloadListList();
        })
        .catch(error => {
            console.error('Error editing list:', error);
            alert('Error editing list. Please try again.');
        });
});

document.getElementById('delete_list').addEventListener('click', function (e) {
    e.preventDefault();

    fetch('task/list/delete?id=' + document.getElementById('id').value, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('List deleted:', data);
            document.getElementsByName('name')[2].value = '';
            ListEModal.style.display = "none";
            ReloadListList();
        })
        .catch(error => {
            console.error('Error deleting list:', error);
            alert('Error deleting list. Please try again.');
        });
});

document.getElementById('edit_task_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    const params = new URLSearchParams({
        'name': formObject['name'],
        'id': formObject['id']
    });

    fetch('task/task/edit', {
        method: 'PUT', body: params.toString(), headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
        .then(response => response.json())
        .then(data => {
            TaskEModal.style.display = "none";
            console.log('Task edited:', data);
            document.getElementsByName('name')[3].value = '';
            ReloadListContent(getCookie('lID')).then(() => {
                if (getCookie('tID') != 0) {
                    try {
                        Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID'))?.click();
                    } catch (error) {
                        alert(error);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error editing task:', error);
            alert('Error editing task. Please try again.');
        });
});

document.getElementById('delete_task').addEventListener('click', function (e) {
    e.preventDefault();
    const tID = document.getElementsByName('id')[1].value;
    if (!confirm('Are you sure you want to delete this task?')) return;

    fetch('task/task/delete?id=' + tID, { method: 'DELETE' })
        .then(data => {
            console.log('Task deleted:', data);
            document.getElementsByName('name')[3].value = '';
            TaskEModal.style.display = "none";

            if (getCookie('tID') === String(tID)) {
                document.cookie = 'tID=0';
                TaskView.innerHTML = '';
            }

            ReloadListContent(getCookie('lID')).then(() => {
                if (getCookie('tID') != 0) {
                    try {
                        Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID'))?.click();
                    } catch (error) {
                        alert(error);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            TaskStack.innerHTML = "";
            TaskStack.appendChild(LandErrorInterface());
        });
});

document.getElementById('add_subtask_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('task/subtask/add', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Subtask added:', data);
            SubtaskModal.style.display = "none";
            document.getElementsByName('name')[4].value = '';
            var NewInterface = new TaskViewInterface();
            NewInterface.reconstructor();
        })
        .catch(error => {
            console.error('Error adding list:', error);
            alert('Error adding list. Please try again.');
        });
});

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const list = urlParams.get('list') != null ? urlParams.get('list') : getCookie('lID') ?? '0';
    if (list == '0') {
        document.cookie = 'lID=0';
    }

    if (getCookie('lID') === (null || undefined)) {
        document.cookie = 'lID=0';
    }
    if (getCookie('tID') === (null || undefined)) {
        document.cookie = 'tID=0';
    }

    // Fetch lists and tasks
    Promise.all([
        fetch('task/list/get', { method: 'GET' }).then(response => response.json()),
        fetch('task/task/get?list=' + list, { method: 'GET' }).then(response => response.json()),
    ])
        .then(([listData, taskData]) => {
            refillStack(listData, 'list');
            Array.from(document.getElementById('list_panel').querySelectorAll('.box')).find(box => box.id === getCookie('lID')).classList.add('selected_box');

            if (taskData = "Tasks not found")
                document.cookie = 'tID=0';
            else
                refillStack(taskData);
            if (getCookie('tID') != 0)
                Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID'))?.click();
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
    return fetch('task/task/get?list=' + lID, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            refillStack(data);
            return data;
        })
        .catch(error => {
            console.error('Error getting data:', error);
            TaskStack.innerHTML = "";
            TaskStack.appendChild(LandErrorInterface());
            throw error;
        });
}

function ReloadListList() {
    fetch('task/list/get', { method: 'GET' }).then(response => response.json())
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
    tID = 0; tName = ''; tFinished = false; tList = 0; tReminder = null; tDue = null; tNote = '';

    ListStack = document.getElementById("list-stack");
    TaskStack = document.getElementById("task-stack");

    SubtaskModal = document.getElementById("add_subtask_modal");
    CloseSubtaskModalButton = document.getElementsByClassName("close_modal")[4];

    constructor(id, name, finished, list, reminder, due, notes) {
        this.tID = id;
        this.tName = name;
        this.tFinished = finished;
        this.tList = list;
        this.tReminder = reminder;
        this.tDue = due;
        this.tNote = notes;

        this.TaskView.innerHTML = "";
        this.TaskView.appendChild(this.TaskViewPart_IDholder(id));
        this.TaskView.appendChild(this.TaskViewPart_Nameplate(name, finished));
        this.TaskView.appendChild(this.TaskViewPart_Subtasks());
        this.TaskView.appendChild(this.TaskViewPart_Note(notes));
        this.TaskView.appendChild(this.TaskViewPart_Reminder(reminder));
        this.TaskView.appendChild(this.TaskViewPart_ListChanger());
        this.TaskView.appendChild(this.TaskViewPart_Controls());

        this.CloseSubtaskModalButton.onclick = (() => {
            document.getElementsByClassName("containbox")[4].style.display = "none";
            this.SubtaskModal.style.display = "none";
        });
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
        checkbox.addEventListener('click', () => {
            this.TaskControl_ToggleFinish(this.tFinished)
        });
        connector.appendChild(checkbox);

        label['htmlFor'] = 'task-finished';
        label.innerText = name;
        connector.appendChild(label);

        item['className'] = 'box cursor_hand';
        item.appendChild(connector);
        item.addEventListener('click', () => {
            this.TaskControl_ToggleFinish(this.tFinished)
        });
        if (finished) item.style.textDecoration = 'line-through';
        return item;
    }

    TaskViewPart_Subtasks() {
        const item = document.createElement('div');
        const AddSubtask = document.createElement('div');
        AddSubtask['className'] = 'box cursor_hand';
        AddSubtask['id'] = 'open_subtask_modal';
        AddSubtask['innerText'] = '• Add subtask';
        AddSubtask.onclick = (() => {
            document.getElementsByName('tID')[0].value = this.tID;
            this.SubtaskModal.style.display = "flex";
        });
        item.appendChild(AddSubtask);

        fetch('task/subtask/get?tID=' + this.tID, { method: 'GET' }).then(response => response.json())
            .then(datas => {
                datas.forEach(data => {
                    item.appendChild(this.TaskInterface_Subtask(data));
                });
            })
            .catch(error => {
                console.error('Error getting data:', error);
                this.TaskView.innerHTML = 'Error getting data: ' + error;
            });

        item.style.paddingLeft = '24px';
        item.style.paddingRight = '24px';
        return item;
    }

    TaskViewPart_Note(note) {
        const item = document.createElement('textarea');
        item['value'] = note;
        item.addEventListener('change', () => {
            this.TaskControl_ChangeNote(item['value'], item);
        });
        item.addEventListener('animationend', () => {
            this.TaskStylesControl_NoteAnimationEnd(item);
        });
        item['placeholder'] = 'Add note';
        return item;
    }

    TaskViewPart_Reminder(reminder) {
        const item = document.createElement('div');
        const group = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');
        const clearButton = document.createElement('button');

        label.innerText = 'Reminder:';
        label.htmlFor = 'reminder';

        input.type = 'datetime-local';
        input.id = 'reminder';
        input.name = 'reminder';
        input.style.maxWidth = 'fit-content';

        if (reminder && reminder !== '000-00-00 00:00:00') {
            //const date = new Date(reminder);
            //if (!isNaN(date.getTime())) {
            //    const year = date.getFullYear();
            //    const month = String(date.getMonth() + 1).padStart(2, '0');
            //    const day = String(date.getDate()).padStart(2, '0'); // TODO: Fix?
            //    const hours = String(date.getHours()).padStart(2, '0');
            //    const minutes = String(date.getMinutes()).padStart(2, '0');
            //    input.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            //}
            input.value = reminder;
        }

        input.addEventListener('change', () => {
            this.TaskControl_RescheduleReminder(input.value);
        });

        clearButton.innerText = 'Clear';
        clearButton.className = 'light cursor_hand';
        clearButton.addEventListener('click', () => {
            input.value = '';
            this.TaskControl_RescheduleReminder('');
        });

        group.style.display = 'ruby';
        group.appendChild(label);
        group.appendChild(input);
        group.appendChild(clearButton);

        item.className = 'box';
        item.appendChild(group);

        return item;
    }

    TaskViewPart_ListChanger() {
        const item = document.createElement('div');
        const due_date_item = document.createElement('div');
        const due_date_label = document.createElement('label');
        const due_date_selector = document.createElement('input');
        const list_selector = document.createElement('select');
        const default_option = document.createElement('option');

        due_date_item.style.display = 'ruby';
        due_date_item.style.maxWidth = 'fit-content';

        due_date_label.innerText = 'Due date:';
        due_date_label.htmlFor = 'due_date_selector';
        due_date_item.appendChild(due_date_label);

        due_date_selector['value'] = this.tDue;
        due_date_selector['type'] = 'date';
        due_date_selector['id'] = 'due_date_selector';
        due_date_selector.style.maxWidth = 'inherit';
        due_date_selector.addEventListener('change', (e) => {
            this.TaskControl_RescheduleFinish(due_date_selector.value);
        });
        due_date_item.appendChild(due_date_selector);
        item.appendChild(due_date_item);

        default_option['value'] = 0;
        default_option['innerText'] = 'No list selected';
        if (0 == this.tList)
            default_option['selected'] = true;
        list_selector.appendChild(default_option);

        fetch('task/list/get', { method: 'GET' }).then(response => response.json())
            .then(datas => {
                datas.forEach(data => {
                    const option = document.createElement('option');
                    option['value'] = data['_id'];
                    option['innerText'] = data['name'];
                    if (data['_id'] == this.tList)
                        option['selected'] = true;
                    list_selector.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error getting data:', error);
                this.TaskView.innerHTML = 'Error getting data: ' + error;
            });

        list_selector.addEventListener('change', () => {
            this.TaskControl_MoveTask(list_selector['value']);
        });

        item['className'] = 'box';
        item.appendChild(list_selector);
        return item;
    }

    TaskViewPart_Controls() {
        const item = document.createElement('div');
        const bin = document.createElement('button');
        const rename = document.createElement('button');

        bin['className'] = 'box destructive light cursor_hand';
        bin['innerText'] = 'Delete task';
        bin.addEventListener('click', () => {
            this.TaskControl_DeleteTask();
        })
        item.appendChild(bin);

        rename['className'] = 'box light cursor_hand';
        rename['innerText'] = 'Rename task';
        rename.addEventListener('click', () => {
            this.TaskControl_RenameTask();
        })
        item.appendChild(rename);

        item['className'] = 'box';
        item['style'] = 'display: block ruby;';
        return item;
    }

    TaskControl_ToggleFinish(currentState) {
        const params = new URLSearchParams({
            'finished': currentState ? '0' : '1',
            'id': this.tID
        });

        fetch('task/task/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(() => {
                this.reconstructor();
                this.tFinished = currentState ? false : true;
            })
            .catch(error => {
                console.error('Error updating data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
    }

    TaskControl_ChangeNote(NewNote, Object) {
        this.TaskStylesControl_NoteAnimationEnd(Object);
        const params = new URLSearchParams({
            'notes': NewNote,
            'id': this.tID
        });

        fetch('task/task/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(async () => {
                this.tNote = NewNote;
                Object.classList.add('textarea_success');
                await this.sleep(3000);
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
                Object.classList.add('textarea_fail');
            });
    }

    TaskControl_MoveTask(NewListID) {
        const params = new URLSearchParams({
            'list': NewListID,
            'id': this.tID
        });

        fetch('task/task/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(async () => {
                this.tList = NewListID;
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    }

    TaskControl_DeleteTask() {
        if (!confirm('Are you sure you want to delete this task?')) return;

        fetch('task/task/delete?id=' + this.tID, { method: 'DELETE' })
            .then(() => {
                document.cookie = 'tID=0';
                this.TaskView.innerHTML = "";
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
    }

    TaskControl_RenameTask() {
        const NewName = prompt('Enter new name');
        if (NewName == null) return;
        const params = new URLSearchParams({
            'name': NewName,
            'id': this.tID
        });

        fetch('task/task/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(async () => {
                this.tName = NewName;
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    }

    TaskControl_ToggleSubtask(stID, finished) {
        const params = new URLSearchParams({
            'finished': finished ? '0' : '1',
            'tID': this.tID,
            'id': stID
        });

        fetch('task/subtask/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(async () => {
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    }

    TaskControl_DeleteSubtask(stID) {
        if (!confirm('Are you sure you want to delete this subtask?')) return;

        fetch('task/subtask/delete?id=' + stID, { method: 'DELETE' })
            .then(() => {
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
    }

    TaskControl_RenameSubtask(stID) {
        const NewName = prompt('Enter new name');
        if (NewName == null) return;
        const params = new URLSearchParams({
            'name': NewName,
            'tID': this.tID,
            'id': stID
        });

        fetch('task/subtask/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(async () => {
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    }

    TaskControl_RescheduleFinish(NewDate) {
        const params = new URLSearchParams({
            'finish_date': NewDate,
            'id': this.tID
        });

        fetch('task/task/edit', {
            method: 'PUT', body: params.toString(), headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(async () => {
                this.tDue = NewDate;
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    }

    TaskControl_RescheduleReminder(newReminder) {
        let formattedReminder = '';
        if (newReminder) {
            const date = new Date(newReminder);
            if (!isNaN(date.getTime())) {
                formattedReminder = date.toISOString().slice(0, 19).replace('T', ' ');
            }
        }

        const params = new URLSearchParams({
            // 'reminder': formattedReminder,
            'reminder': newReminder,
            'id': this.tID
        });

        fetch('task/task/edit', {
            method: 'PUT',
            body: params.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(() => {
                console.log('Reminder updated successfully');
                if (window.notificationManager) {
                    window.notificationManager.clearReminder(this.tID);
                }
                this.showRemiderFeedback('Reminder updated!', 'success');
                this.reconstructor();
            })
            .catch(error => {
                console.error('Error updating rminder:', error);
                this.showRemiderFeedback('Error updating reminder', 'error');
            });
    }

    TaskStylesControl_NoteAnimationEnd(Object) {
        if (Object.classList.contains('textarea_fail'))
            Object.classList.remove('textarea_fail');
        if (Object.classList.contains('textarea_success'))
            Object.classList.remove('textarea_success');
    }

    TaskPage_RefillStack(inputdata, stack = 'task') {
        switch (stack) {
            case 'list':
                this.ListStack.innerHTML = "";
                inputdata.forEach(data => {
                    //this.ListStack.appendChild(this.TaskInterface_List(data));
                    this.ListStack.appendChild(window.ListInterface(data));
                });
                break;
            case 'task':
            default:
                this.TaskStack.innerHTML = "";
                inputdata.forEach(data => {
                    this.TaskStack.appendChild(window.TaskInterface(data));
                });
                break;
        }
    }

    TaskInterface_List(data) {
        const listitem = document.createElement('div');
        listitem['className'] = 'box cursor_hand';
        listitem['id'] = data["_id"];
        listitem['innerText'] = data['name'];
        listitem['onclick'] = function () { OpenList(this); };
        return listitem;
    }

    TaskInterface_Task(data) {
        const taskitem = document.createElement('div');
        taskitem['className'] = 'box cursor_hand';
        taskitem['id'] = data["_id"];
        taskitem['innerText'] = data['name'];
        if (data['finish_date']) {
            taskitem['innerText'] += ' • Due date: ' + new Date(data['finish_date']).toLocaleDateString();
        }
        taskitem['onclick'] = function () { OpenTask(this, data['_id'], data['name'], data['finished'], data['list'], data['reminder'], data['finish_date'], data['notes']); };
        if (data['finished']) taskitem.style.textDecoration = 'line-through';
        return taskitem;
    }

    TaskInterface_Subtask(data) {
        const subtaskitem = document.createElement('div');

        // left side of item
        const connector_left = document.createElement('div');
        const checkbox = document.createElement('input');
        const label = document.createElement('label');

        checkbox['type'] = 'checkbox';
        checkbox['name'] = 'subtask-finished';
        checkbox['id'] = 'subtask-finished-' + data['_id'];
        checkbox['checked'] = data['finished'] ? 1 : 0;
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.TaskControl_ToggleSubtask(data['_id'], data['finished']);
        });
        if (data['finished']) connector_left.style.textDecoration = 'line-through';
        connector_left.appendChild(checkbox);

        label['htmlFor'] = 'subtask-finished-' + data['_id'];
        label['innerText'] = data['name'];
        connector_left.appendChild(label);

        // right side of item
        const connector_right = document.createElement('div');
        const bin = document.createElement('button');
        const rename = document.createElement('button');

        bin['className'] = 'destructive light cursor_hand';
        bin['innerText'] = 'D';
        bin.addEventListener('click', (e) => {
            e.stopPropagation();
            this.TaskControl_DeleteSubtask(data['_id']);
        });
        connector_right.appendChild(bin);

        rename['className'] = 'light cursor_hand';
        rename['innerText'] = 'R';
        rename.addEventListener('click', (e) => {
            e.stopPropagation();
            this.TaskControl_RenameSubtask(data['_id']);
        });
        connector_right.appendChild(rename);

        connector_right.style.display = 'flex';
        connector_right.style.alignItems = 'center';
        connector_right.style.gap = '10px';

        subtaskitem['className'] = 'box cursor_hand';
        subtaskitem.style.flexDirection = 'row';
        subtaskitem.style.justifyContent = 'space-between';
        subtaskitem.style.alignItems = 'center';
        subtaskitem.appendChild(connector_left);
        subtaskitem.appendChild(connector_right);
        subtaskitem.addEventListener('click', () => {
            this.TaskControl_ToggleSubtask(data['_id'], data['finished']);
        });
        return subtaskitem;
    }

    reconstructor() {
        const urlParams = new URLSearchParams(window.location.search);
        const list = urlParams.get('list') != null ? urlParams.get('list') : getCookie('lID') ?? '0';
        fetch('task/task/get?list=' + list, { method: 'GET' }).then(response => response.json())
            .then(data => {
                this.TaskPage_RefillStack(data);
                if (getCookie('tID') != 0)
                    Array.from(document.getElementById('lists_tasks').querySelectorAll('.box')).find(box => box.id === getCookie('tID'))?.click();
            })
            .catch(error => {
                console.error('Error getting data:', error);
                TaskStack.innerHTML = "";
                TaskStack.appendChild(LandErrorInterface());
            });
    }

    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    showRemiderFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.innerText = message;
        feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;

        document.body.appendChild(feedback);

        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 3000);
    }
}