function sendCheckboxStatus(checkboxID) {
    const checkbox = document.getElementById(checkboxID);

    if (!checkbox) {
        console.error(`Checkbox with ID "${checkboxID}" not found.`);
        return;
    }

    checkbox.addEventListener('change', function () {
        const url = `/admin/set?enable_user_creation=${this.checked ? '1' : '0'}`;

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300)
                console.log('Setting updatet successfully:', xhr.responseText);
            else
                console.error('Error updating setting:', xhr.status, xhr.statusText);
        };

        xhr.onerror = function () {
            console.error('Request failed.');
        };

        xhr.send();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    sendCheckboxStatus('enable_user_creation');
});