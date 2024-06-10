
// This script is for the ENGD250 grade bucket. It allows the instructor to import a CSV file and display the data on the page for further processing.

// Author: Bennett Xia
// Last Updated: 06-09-2024


const users = [];
const key = [];
const tolerance = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03];
const gradeMulti = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0];

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const fileInput = document.getElementById('fileInput');
    const keyInput = document.getElementById('keyInput');
    const importButton = document.getElementById('importButton');
    const processButton = document.getElementById('processButton');
    const importKeyButton = document.getElementById('importKeyButton');
    const output = document.getElementById('output');

    if (importButton && fileInput && processButton && importKeyButton) {
        console.log('Elements found');

        
        importKeyButton.addEventListener('click', function() {
            console.log('Import key button clicked');
            keyInput.click();
        });

            keyInput.addEventListener('change', function(event) {
                console.log('Key input changed');
                const keyFile = event.target.files[0];
                if (keyFile) {
                    console.log('Key file selected:', keyFile.name);
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const data = e.target.result;
                        console.log(data);

                        getKey(data);

                        if (key.length > 0) {
                            keyIndicator.style.display = 'block';
                            importKeyButton.style.display = 'none';
                            console.log('Key uploaded successfully');
                        } else {
                            console.error('Key not found');
                        }
                    };
                    reader.readAsText(keyFile);
                } else {
                    alert('No key file selected');
                }
            });


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

                        processButton.style.display = 'block';
                        
                        processButton.addEventListener('click', function() {
                        // alert('Processing the file...');
                        output.textContent = '';

                        if (key) {
                            try {
                            processCsvData(contents);
                            makeTableDev(users);
                            } catch (error) {
                                alert('An error occurred while processing CSV data:', error);
                                console.error('An error occurred while processing CSV data:', error);
                            }
                        } else {
                            alert('Please import the keyFile first!');
                            console.error('Key not found');
                        }
                        
                    });
                    //hide the import button after importing
                    importButton.style.display = 'none';
                    docIndicator.style.display = 'block';

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

function getKey(data) {
    // Get anwser keys for each question from imported csv file
    const lines = data.split('\n');
    const anwser = lines[0].split(',');
    for (let i = 0; i < anwser.length; i++) {
        key.push(anwser[i]);
    }
    console.log(key);
    return key;
}

function processCsvData(data) {


    console.log('Processing CSV data...');

    // const users = [];
    let currentUser = null;

    // Split the data into rows
    const lines = data.split('\n');

    // Loop through each row, if the same username, add to the same user object
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === "") continue; // Skip empty lines
        if (line.split(',')[9] === "") continue; //skip the first and last line of each student

        const parts = line.split(',');
        const username = parts[1];
        const firstname = parts[2];
        const lastname = parts[3];
        const qn = parts[8];
        const qa = parts[14];
        let deviation = 0;

        // Check if the username is the same as the previous row
        if (currentUser && username === currentUser.username) {
            // Add the question Number and answer to the user object
            // currentUser.q.push({ qn: qn, qa: qa });

            deviation = Math.abs(qa - key[qn-1])/key[qn-1];

            currentUser.q.push({ qn: qn, qa: qa, qd: deviation});
        } else {
            // Add the previous user object to the users array
            if (currentUser) {
                users.push(currentUser);
                // displayUser(currentUser);
            }

            // Create a new user object
            currentUser = {
                username: username,
                firstname: firstname,
                lastname: lastname,
                q: [{ qn: qn, qa: qa, qd: Math.abs(qa - key[qn-1])/key[qn-1]}]
               
            }; 
        }
    }

    // Add the last user to the array
    if (currentUser) {
        users.push(currentUser);
        // displayUser(currentUser);
    }
}

function displayUser(user) {
    const output = document.getElementById('output');
    output.textContent += `${user.username}, ${user.firstname}, ${user.lastname}, `;
    user.q.forEach(question => {
        output.textContent += `${question.qa}, `;
    });
    output.textContent += '\n';
    
    //hide the process and import button after processing
    processButton.style.display = 'none';
    importButton.style.display = 'none';
    //show the export button after processing
    exportButton.style.display = 'block';
}

function makeTableDev(users) {
    //create table
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.setAttribute('cellpadding', '5');
    table.setAttribute('cellspacing', '0');

    //create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Username', 'First Name', 'Last Name'].forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    //add question number to the header based on the amount of questions
    users[0].q.forEach(question => {
        const headerCell = document.createElement('th');
        headerCell.textContent = 'Q' + question.qn;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    //create table body
    const tbody = document.createElement('tbody');
    users.forEach(user => {
        const row = document.createElement('tr');

        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        row.appendChild(usernameCell);

        const firstnameCell = document.createElement('td');
        firstnameCell.textContent = user.firstname;
        row.appendChild(firstnameCell);

        const lastnameCell = document.createElement('td');
        lastnameCell.textContent = user.lastname;
        row.appendChild(lastnameCell);

        user.q.forEach(question => {
            const qaCell = document.createElement('td');
            // qaCell.textContent = question.qa;
            // qaCell.textContent = question.qa + ' (' + (question.qd / 100).toFixed(2) + '%)' + ' ' + bucket(question.qd);
            qaCell.textContent = bucket(question.qd);
            row.appendChild(qaCell);
        });

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    //append table to the output div
    output.appendChild(table);


    //hide the process and import button after processing
    processButton.style.display = 'none';
    importButton.style.display = 'none';
    //show the export button after processing
    exportButton.style.display = 'block';
}

function bucket(dev) {
    for (let i = 0; i < tolerance.length; i++) {
        if (dev <= tolerance[i]) {
            return gradeMulti[i];
        }
    }
    return 0;
    
}