const imageUpload = document.getElementById('avatar');
const imagePreview = document.getElementById('preview');

imageUpload.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();

        reader.addEventListener('load', function () {
            imagePreview.src = reader.result;
            imagePreview.style.display = 'block';
        });

        reader.readAsDataURL(file);
    }
});