function showSection(sectionId) {
    // get all sections
    const sections = document.querySelectorAll('.content-section');

    // hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// show only the welcome section on page load
document.addEventListener('DOMContentLoaded', () => {
    showSection('welcome');
});