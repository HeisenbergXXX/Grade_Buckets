// This script is for the ENGD250 grade bucket. It allows the instructor to import a CSV file and display the data on the page for further processing.

//********************************************************************************************************************
// Features:
//1. Calculate the grade based on the deviation of the answer from the key for mass and volume questions.
//2. Calculate the grade based on the how far the center of mass is from the 'TRUE' center of mass for each part.
//3. Test title is read from the imported file name, makes exporting easier and zero input required.
//4. Grade results are broke down and displayed in a table format for easy viewing.

// Limitations:
//1. The script is designed for a specific type of test, it will not work for other types of tests.
//      a. The script is designed for a test that has 20 questions or less, Max 4 parts, each part has 5 questions (1 mass, 1 volume, center of mass XYZ).
//      b. Each question is worth 10 points, the total points are calculated based on the number of questions.
//      c. Parts of the codes are 'hardcoded' to fit the specific test type. (format of the exported file from D2L)
//2. Refresh the page will reset the data, the script does not have a save feature, except for exporting the data.

//********************************************************************************************************************

// Author: Bennett Xia
// First created: 2024-06-09

const tolerance = [0.01, 0.03, 0.05, 0.07, 0.08, 0.1];
const gradeMulti = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.2];
const users = [];   //... to store user data...
const key = [];     //... to store question key...
const radius = [];  //tolerence radius for center of mass, each part has a different tolerance radius
const bf = 0.03;      //bounding box volume factor. Sphere volume = Box volume * bf
let testTitle = ''; //read from import file title
let questionCount;  //set after key is imported (key.length)
let partCount;      //set after key is imported, each part has 5 questions(mass, volume, center of mass XYZ)
let totalPoints;    //set after key is imported, each question 10 points (1 mass, 6 volume, 3 center of mass)
let avgChart;

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const fileInput = document.getElementById('fileInput');
    const keyInput = document.getElementById('keyInput');
    const importButton = document.getElementById('importButton');
    const processButton = document.getElementById('processButton');
    const importKeyButton = document.getElementById('importKeyButton');
    const output = document.getElementById('output');

    // Display the tolerance values and grade multipliers in the DOM
    const toleranceField = document.getElementById('toleranceArray'); 
    toleranceField.innerHTML = tolerance.map((value, index) => 
        `<div class="tolerance-row">
            <input type="number" step="1" id="tolerance_${index}" value="${(value * 100).toFixed(0)}">%
            <span> --- </span>
            <span>[${gradeMulti[index]}]</span>
        </div>` 
    ).join(''); 

    // Update tolerance array based on user input and re-calculate results 
    document.getElementById('updateToleranceButton').addEventListener('click', () => {
        tolerance.forEach((_, index) => {
            tolerance[index] = parseFloat(document.getElementById(`tolerance_${index}`).value) / 100; 
        });
        console.log('Updated tolerance:', tolerance);
        alert('Tolerance values updated successfully!');
        
        // Recalculate results
        users.forEach(user => {
            calculateGrade(user);
        });

        // Clear previous content
        const output = document.getElementById('output');
        output.innerHTML = '';
        avgChart.destroy();
        makeTableDev(users);
    });

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
                    // console.log(data);
                    getKey(data);
                    questionCount = key.length;
                    partCount = key.length/5;
                    totalPoints = partCount * 10;

                    if (key.length > 0) {
                        keyIndicator.style.display = 'block';
                        importKeyButton.style.display = 'none';
                        console.log('Key uploaded successfully');
                    } else {
                        console.error('Key not found');
                        alert('Key not found');
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

                testTitle = file.name.split(' ').slice(0, -3).join(' ');
                console.log('Test title:', testTitle);

                const reader = new FileReader();
                reader.onload = function(e) {
                    const contents = e.target.result;
                    output.textContent = contents;

                    processButton.style.display = 'block';

                    processButton.addEventListener('click', function() {
                        // alert('Processing the file...');
                        output.textContent = '';

                        if (key) {
                            try {
                                processCsvData(contents);
                                makeTableDev(users);
                                processButton.style.display = 'none';
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


        // Export button
        const exportButton = document.getElementById('exportButton');
        exportButton.addEventListener('click', function() {
            console.log('Export button clicked');
            const csv = `Username,${testTitle} Points Grade,End-of-Line Indicator\n` + users.map(user => {
                return `#${user.username},${(user.ut[0]+user.ut[1]).toFixed(2)},#`;
            }).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = testTitle + '_GradeAdjusted.csv';
            a.click();

        });

    } else {
        console.error('Elements not found');
    }
});

function getKey(data) {
    // Get answer keys for each question from imported csv file
    const lines = data.split('\n');
    const answer = lines[0].split(',');
    const boxVols = lines[1].split(',');
    console.log('Answers: ', answer);
    console.log('Box Volumes:', boxVols);

    for (let i = 0; i < answer.length; i++) {
        key.push(answer[i]);
    }

    //calculate the radius for each part
    for (let i = 0; i < boxVols.length; i++) {
        radius.push((Math.cbrt(3*(boxVols[i]*bf)/(4*Math.PI))).toFixed(2));
    }

    console.log('Key:', key);
    console.log('Radius:', radius);

    return key;
}

function processCsvData(data) {
    console.log('Processing CSV data...');
    console.log('Tolenance:', tolerance);

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
        const qn = parseFloat(parts[8]);
        let qa = parseFloat(parts[14]);
        const qp = parseFloat(parts[17]);
        let qk = parseFloat(key[qn - 1]);   //key for the question
        let deviation = 100;      //zero is ideal

        //check for null value and replace with something (not necessary for now)
        // qa === "" ? qa = 'null' : qa = parseFloat(qa);

        //check key if it is zero
        if (qk !== 0) {
            deviation = Math.abs((qa - qk) / qk);
        } else {
            deviation = Math.abs(qa);
        }

        // Check if the username is the same as the previous row
        if (currentUser && username === currentUser.username) {
            currentUser.q.push({ qn: qn, qa: qa, qp: qp, qd: deviation });
        } else {
            // Add the previous user object to the users array
            if (currentUser) {           
                users.push(currentUser);                
                
                //call the function to calculate the grade
                calculateGrade(currentUser);
            }

            // Create a new user object
            currentUser = {
                username: username,
                firstname: firstname,
                lastname: lastname,
                q: [{ qn: qn, qa: qa, qp: qp, qd: deviation}],
                r : Array(partCount).fill(null),
                ut: [null, null]
            };
        }
    }

    // Add the last user to the array
    if (currentUser) {
        users.push(currentUser);

        //call the function to calculate the grade
        calculateGrade(currentUser);

    }
}

function calculateGrade(currentUser) {

    //calculate the deviation of the center of mass
    const indices = [];
    for (let i = 0; i < questionCount; i += 5) {
        indices.push([i + 2, i + 3, i + 4]);
    }
    
    for (let i = 0; i < indices.length; i++) {
        let sumOfSquares = 0;
        for (let j = 0; j < indices[i].length; j++) {
            let index = indices[i][j];
            sumOfSquares += Math.pow(currentUser.q[index].qa - key[index], 2);
        }
        currentUser.r[i] = Math.sqrt(sumOfSquares).toFixed(3);
    }
    
    //calculate the total grade for regular questions
    const utReg = currentUser.q.reduce((acc, question) => {
        if (![3, 4, 5, 8, 9, 10, 13, 14, 15, 18, 19, 20].includes(question.qn)) {
            return acc + bucket(question.qd) * question.qp;
        } else {
            return acc;
        }
    }, 0);
        // console.log('utReg:', utReg);

    // console.log('User:', currentUser);
    //compare the center of mass deviation with radius, then sum up into utCoM
    const utCoM = currentUser.r.reduce((acc, r, index) => {
        const currentRadius = radius[index];
        const condition = (r - currentRadius);
        
        // console.log('r:', r);
        // console.log('radius:', currentRadius);
        // console.log(condition);
    
        if (condition < 0) {
            // console.log('Good!');
            return acc + 3;
        } else {
            // console.log('Bad!');
            return acc;
        }
    }, 0);
        // console.log('utCoM:', utCoM);

    currentUser.ut[0] = utReg;
    currentUser.ut[1] = utCoM;
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
    
    //add total to the header
    const totalCell = document.createElement('th');
    totalCell.textContent = 'Point Total' + ' (' + totalPoints + ')';
    totalCell.style.backgroundColor = 'orange';
    totalCell.style.color = 'white';
    headerRow.appendChild(totalCell);
    
    //add percentage to the header
    const percentCell = document.createElement('th');
    percentCell.textContent = 'Grade %';
    headerRow.appendChild(percentCell);
    
    //add question number to the header based on the amount of questions
    users[0].q.forEach((question, index) => {
        const headerCell = document.createElement('th');
        headerCell.textContent = 'Q' + question.qn;
        headerRow.appendChild(headerCell);

        if (![3, 4, 5, 8, 9, 10, 13, 14, 15, 18, 19, 20].includes(index + 1)) {
        headerCell.style.backgroundColor = 'grey';
        headerCell.style.color = 'white';
        }
    });
    
    //add center of mass to the header
    const CoMCell = document.createElement('th');
    CoMCell.textContent = ' CoM Deviation(Length) ' + 'Sphere r=' + radius;
    CoMCell.setAttribute('colspan', partCount);
    headerRow.appendChild(CoMCell);

    //add a total for center of mass header
    const CoMTotalCell = document.createElement('th');
    CoMTotalCell.textContent = 'CoM';
    CoMTotalCell.style.backgroundColor = 'grey';
    CoMTotalCell.style.color = 'white';
    headerRow.appendChild(CoMTotalCell);

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

        const totalCell = document.createElement('td');
        totalCell.textContent = (user.ut[0]+user.ut[1]).toFixed(2);
        totalCell.style.backgroundColor = 'orange';
        totalCell.style.color = 'white';
        row.appendChild(totalCell);

        const PercentCell = document.createElement('td');
        PercentCell.textContent = ((user.ut[0]+user.ut[1])/totalPoints*100).toFixed(2) + '%';
        row.appendChild(PercentCell);
        
        user.q.forEach((question, index) => {
            const qaCell = document.createElement('td');
            qaCell.textContent = (bucket(question.qd) * question.qp).toFixed(2).replace(/\.?0+$/, '');
            row.appendChild(qaCell);

            if (![3, 4, 5, 8, 9, 10, 13, 14, 15, 18, 19, 20].includes(index + 1)) {
            qaCell.style.backgroundColor = 'grey';
            qaCell.style.color = 'white';
            }
        });


        for (let i = 0; i < user.r.length; i++) {
            const partCoMCell = document.createElement('td');
            partCoMCell.textContent = user.r[i];
            partCoMCell.textContent += '(Part' + (i + 1) + ')';
            row.appendChild(partCoMCell);
        }
        
        
        const CoMCell = document.createElement('td');
        CoMCell.textContent = user.ut[1];
        CoMCell.style.backgroundColor = 'grey';
        CoMCell.style.color = 'white';
        row.appendChild(CoMCell);


        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    //append table to the output div
    output.appendChild(table);

    //hide the process and import button after processing
    // processButton.style.display = 'none';
    importButton.style.display = 'none';
    //show the export button after processing
    exportButton.style.display = 'block';

    //calculate and display class average
    let sum = 0;
    let count = 0;
    let f = 0;
    const scoreRanges = new Array(10).fill(0);
    users.forEach(user => {
        sum += user.ut[0] + user.ut[1];
        count++;
        const userScore = (user.ut[0] + user.ut[1])/totalPoints*100;
        const rangeIndex = Math.min(Math.floor(userScore / 10), 9); // Ensure max index is 9 (for 90-100 range)
        scoreRanges[rangeIndex]++;
        userScore < 50 ? f++ : f;
    });
    console.log('Class sum:', sum);
    const average = sum / count / totalPoints;
    console.log('Class average:', average);
    document.getElementById('classAverage').textContent = 'Class average: ' + (average*100).toFixed(2)+ '%';
    document.getElementById('classAverage').style.display = 'block';
    document.getElementById('classCount').textContent = 'Class Size: ' + count;
    document.getElementById('classCount').style.display = 'block';
    document.getElementById('fCount').textContent = 'Failed: ' + f + '(' + (f/count*100).toFixed(2) + '%)';
    document.getElementById('fCount').style.display = 'block';

    createChart(scoreRanges);

}

function createChart(count){
    const ctx = document.getElementById('avgChart').getContext('2d');
    avgChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
            datasets: [{
                label: 'Number of Users',
                data: count,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

}

function bucket(dev) {
    for (let i = 0; i < tolerance.length; i++) {
        if (dev <= tolerance[i]) {
            return gradeMulti[i];
        }
    }

    // uncomment this if you want to apply no bucket (and comment out the above for-loop)
    // if (dev <= 0.01) {return 1;}    

    return 0;
}


