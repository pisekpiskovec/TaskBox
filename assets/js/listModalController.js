var ListModal = document.getElementById("add_list_modal");
var TaskModal = document.getElementById("add_task_modal");

var OpenListModalButton = document.getElementById("open_list_modal");
var OpenTaskModalButton = document.getElementById("open_task_modal");

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