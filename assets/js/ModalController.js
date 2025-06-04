var ListModal = document.getElementById("add_list_modal");
var TaskModal = document.getElementById("add_task_modal");

var OpenListModalButton = document.getElementById("open_list_modal");
var OpenTaskModalButton = document.getElementById("open_task_modal");

var ListStack = document.getElementById("list-stack");
var TaskStack = document.getElementById("task-stack");

var CloseListModalButton = document.getElementsByClassName("close_modal")[0];
var CloseTaskModalButton = document.getElementsByClassName("close_modal")[1];

OpenListModalButton.onclick = function () {
    document.getElementsByClassName("containbox")[0].style.display = "flex";
    ListModal.style.display = "block";
}

OpenTaskModalButton.onclick = function () {
    document.getElementsByClassName("containbox")[1].style.display = "flex";
    TasktModal.style.display = "block";
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
    taskitem['onclick'] = function () { OpenTask(this); };
    if (data['finished']) taskitem.style.textDecoration = 'line-through';
    return taskitem;
}

function OpenList(ListItem) {
    Promise.all(
        fetch('/task/task/get?list=' + ListItem.id, { method: 'GET' }).then(response => response.json())
    )
        .then(data => {
            refillStack(data);
        })
        .catch(error => {
            console.error('Error getting data:', error);
            TaskStack.innerHTML = "";
            TaskStack.appendChild(LandErrorInterface());
        });
}

function OpenTask(TaskItem) {
    alert(TaskItem.id);
}

function refillStack(data, stack = 2) {
    switch (stack) {
        case 'list' ?? 1:
            ListStack.innerHTML = "";
            ListStack.appendChild(ListInterface(data));
            break;
        case 'task' ?? 2:
        default:
            TaskStack.innerHTML = "";
            TaskStack.appendChild(TaskInterface(data));
            break;
    }
}

function refreshStacks(listData, taskData) {
    ListStack.innerHTML = "";
    listData.forEach(data => {
        ListStack.appendChild(ListInterface(data));
    });

    TaskStack.innerHTML = "";
    taskData.forEach(data => {
        TaskStack.appendChild(TaskInterface(data));
    });
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
            location.reload();
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
            location.reload();
        })
        .catch(error => {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        });
});

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const list = urlParams.get('list') != null ? urlParams.get('list') : '';

    // Fetch lists and tasks
    Promise.all([
        fetch('/task/list/get', { method: 'GET' }).then(response => response.json()),
        fetch('/task/task/get?list=' + list, { method: 'GET' }).then(response => response.json()),
    ])
        .then(([listData, taskData]) => {
            refreshStacks(listData, taskData);
        })
        .catch(error => {
            console.error('Error getting data:', error);
            alert('Error getting data. Please try again later.');
        });
};