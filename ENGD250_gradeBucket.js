
// This script is for the grade bucket page. It allows the user to import a CSV file and display the data on the page.

// Author: Bennett Xia
// Last Updated: 06-08-2024


document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const importButton = document.getElementById('importButton');
    const fileInput = document.getElementById('fileInput');
    const processButton = document.getElementById('processButton');
    const output = document.getElementById('output');

    if (importButton && fileInput && processButton) {
        console.log('Elements found');

        importButton.addEventListener('click', function() {
            console.log('Import button clicked');
            fileInput.click();
        });

        fileInput.addEventListener('change', function(event) {
            console.log('File input changed');
            const file = event.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                const reader = new FileReader();
                reader.onload = function(e) {
                    const contents = e.target.result;
                    // processCsvData(contents);
                    output.textContent = contents;
                    // Show the process button after file selection
                    processButton.style.display = 'inline-block';

                    processButton.addEventListener('click', function() {
                    // alert('Processing the file...');
                    output.textContent = '';
                    processCsvData(contents);
                    });
                };
                reader.readAsText(file);
            } else {
                alert('No file selected');
            }
        });
    } else {
        console.error('Elements not found');
    }
});

function processCsvData(data) {
    console.log('Processing CSV data...');

    const users = [];
    let currentUser = null;

    // Split the data into rows
    const lines = data.split('\n');

    // Loop through each row, if the same username, add to the same user object
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === "") continue; // Skip empty lines

        const parts = line.split(',');
        const username = parts[1];
        const firstname = parts[2];
        const lastname = parts[3];
        const qn = parts[8];
        const qa = parts[14];

        // Check if the username is the same as the previous row
        if (currentUser && username === currentUser.username) {
            // Add the question Number and answer to the user object
            currentUser.q.push({ qn: qn, qa: qa });
        } else {
            // Add the previous user object to the users array
            if (currentUser) {
                users.push(currentUser);
                displayUser(currentUser);
            }

            // Create a new user object
            currentUser = {
                username: username,
                firstname: firstname,
                lastname: lastname,
                q: [{ qn: qn, qa: qa }]
            };
        }
    }

    // Add the last user to the array
    if (currentUser) {
        users.push(currentUser);
        displayUser(currentUser);
    }
}

function displayUser(user) {
    const output = document.getElementById('output');
    output.textContent += `${user.username}, ${user.firstname}, ${user.lastname}, `;
    user.q.forEach(question => {
        output.textContent += `${question.qa}, `;
    });
    output.textContent += '\n';
}
