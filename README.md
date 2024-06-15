Grade Bucket

This Mini web app is to apply "Bucket Scheme" to Solidworks test. 
Based on the traditional tolerence method, students will ether get a full mark on a question if it's anwser falls within the given tolerence(1%) or zero. This app is to determin a mark based on how far off the anwser is. 

Still working in progress...

How to use:
1. Download the files; (Click the Green "Code" button, then download ZIP)
2. Open "GradeBucket.html" with any browser;
3. Import an anwserKey.csv;
   * type all correct anwsers in a line seperated by ',' and save it as a csv/text file.
      e.g.  10,15,0,0,5,20,25,0,5,0,30,35,5,5,0
4. Import students grade export (csv) file;
   * download from D2L: Drop down on a test -> grade -> export to CSV file; (Wait for a second then Click the notification Bell to find the download link)
   * DO NOT RENAME THE FILE!
6. After the csv file content load, Click process;
7. Review the results displayed;
8. Click Export; (Find the file in download folder called: xxxxxxx_GradeAdjusted.csv)
9. Upload back to D2L. (Under Assessments/Grades -> Blue ImportGrade button)
10. Done.

* Refresh the page at anytime will reset everything!



Features:
1. Calculate the grade based on the deviation of the answer from the key for mass and volume questions.
2. Calculate the grade based on the how far the center of mass is from the 'TRUE' center of mass for each part.
3. Test title is read from the imported file name, makes exporting easier and zero input required.
4. Grade results are broke down and displayed in a table format for easy viewing.

Limitations:
1. The script is designed for a specific type of test, it will not work for other types of tests.
      a. The script is designed for a test that has 20 questions or less, Max 4 parts, each part has 5 questions (1 mass, 1 volume, center of mass XYZ).
      b. Each question is worth 10 points, the total points are calculated based on the number of questions.
      c. Parts of the codes are 'hardcoded' to fit the specific test type. (format of the exported file from D2L)
2. Refresh the page will reset the data, the script does not have a save feature, except for exporting the data.
   
