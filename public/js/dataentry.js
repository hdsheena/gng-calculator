// add listener for toggle id modeSwitch
const modeSwitch = document.getElementById('modeSwitch');
const mineshaftTableContainer = document.getElementById('mineshaftTableContainer');

modeSwitch.addEventListener('change', function() {
 
    const mineshaftTableContainer = document.getElementById('mineshaftTableContainer');
    if (modeSwitch.checked) {
      mineshaftTableContainer.style.display = 'none';
    } else {
      mineshaftTableContainer.style.display = 'block';
    }
  }
);
// define get_mineshafts
const get_mineshafts = async (eventId) => {
  return await fetch(`api/event/${eventId}/shafts`)
    .then(async (response) => {
      if (response.status === 200) {
        const data = await response.json()
        return {
          "status": true,
          "content": data
        };
      } else {
        console.error(`Server error (${response.status})`);
        return {
          "status": false,
          "content": response.status
        };
      }
    }
    )
    .catch((error) => {
      console.error(error);
      return {
        "status": false,
        "content": "Unknown"
      };
    }
    )
}
const build_input_html = async (eventId) => {

    // get the mineshafts for the event_id from the sqlite database
    const mineshafts = await get_mineshafts(eventId);
    // if the mineshafts are found, generate the table
    if (mineshafts["status"]) {
        const shaftTable = document.createElement('table');
        shaftTable.id = 'shaftTable';
        shaftTable.className = 'table table-striped table-bordered table-hover';
        shaftTable.innerHTML = `
            <thead>
                <tr>
                <th>Event ID</th>
                <th>Shaft Name</th>
                <th>Cost</th>
                <th>Event ID</th>
                <th>Current Level</th>
                <th>Set Level</th>
                </tr>
            </thead>
            <tbody>
                ${mineshafts["content"].map(shaft => `
                    <tr>
                        <th scope="row">${shaft.id}</th>
                        <td>${shaft.name}</td>
                        <td>${shaft.cost}</td>
                        <td>${shaft.event_id}</td>
                        <td>${shaft.level}</td>
                        <td><input></input></td>
                        
                    </tr>
                `).join('')}
            </tbody>
        `;
        // replace the element with the id shaftTable with the new table
        const shaftTableElement = document.getElementById('shaftTable');
        shaftTableElement.parentNode.replaceChild(shaftTable, shaftTableElement);
    }
};