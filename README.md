# FullCalenderGuide
A simple tutorial guide to add  a calendar to you web applications and perform CRUD operations such as add event,delete event and reschedule event using PHP.
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation
1.Install the Fullcalender core package and any plugins :
Note:install the core package in the same directory as your project file.<br>

`npm install @fullcalendar/core @fullcalendar/interaction @fullcalendar/daygrid`


## Usage
1.Install XAMPP server and follow the instructions to setup.<br>
2.Create a new repository and clone it into the htdocs folder under the XAMMP Directory.<br>
3.create an index.php file.<br>
4.within the PHP tags <?php ... ?>; include the code bases below.<br>

a. Initialzie the javascript library from the package downloaded.<br> <script src='https://cdn.jsdelivr.net/npm/fullcalendar/index.global.min.js'></script>

b. Write the javascript script to load the DOM content and render the calender content.
``` javascript
    <script>

      document.addEventListener('DOMContentLoaded', function() {
        const calendarEl = document.getElementById('calendar')
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth'
        })
        calendar.render()
      })
      

    </script>
```
c. Create a div with an id of "calender" as specified in the DOM Loading Script.
``` html
        <div id='calendar'></div>

```
5.Run your code and the calender should be displayed on the screen.

## PHP CRUD Operations
1. Open your open your browser and navigate to http://localhost/phpmyadmin/ <br>
2. Create a new database called "Events".<br>
3. Paste the SQL provided in the Events.sql file to create the required tables.<br>
4. Setup your files to match the PHP files provided.<br>
5. Once all steps are followed you should be able to add,delete and update an event.

## Features
1.Dynamic calender view.<br>
2.Calender CRUD operations.
