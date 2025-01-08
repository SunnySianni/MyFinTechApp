<script src="/js/main.js"></script>
app.use('/js', express.static(path.join(__dirname, 'public/js')));
function onDocumentLoad() {
    const element = document.querySelector('.some-class'); // Replace with the actual selector
    if (element) {
        element.classList.add('new-class');
    }
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);