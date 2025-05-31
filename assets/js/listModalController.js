var ListModal = document.getElementById("add_list_modal");

var btn = document.getElementById("open_list_modal");

var span = document.getElementsByClassName("close_modal")[0];

btn.onclick = function () {
    document.getElementsByClassName("containbox")[0].style.display = "flex";
    ListModal.style.display = "block";
}

span.onclick = function () {
    document.getElementsByClassName("containbox")[0].style.display = "none";
    ListModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == ListModal) {
        ListModal.style.display = "none";
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