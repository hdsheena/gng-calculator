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
                <th>Shaft ID</th>
                <th>Shaft Name</th>
                <th>Cost</th>
                <th>Income</th>
                <th>Current Level</th>
                <th>Set Level</th>
                </tr>
            </thead>
            <tbody>
                ${mineshafts["content"].map(shaft => `
                    <tr>
                    <td>${shaft.event_id}</td>
                        <th scope="row">${shaft.id}</th>
                        <td>${shaft.name}</td>
                        <td>${shaft.cost}</td>
                       <td>${shaft.income}</td>
                        <td>${shaft.level}</td>
                        <td><input id="setLevelInput-${shaft.id}"></input></td>
                        <td><button id="setLevelButton-${shaft.id}">Set Level</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        // replace the element with the id shaftTable with the new table
        const shaftTableElement = document.getElementById('shaftTable');
        shaftTableElement.parentNode.replaceChild(shaftTable, shaftTableElement);
    }
};
// add listener for button id setLevelButton
document.addEventListener('click', async function(event) {
    if (event.target.id.startsWith('setLevelButton-')) {
        const shaftId = event.target.id.split('-')[1];
        const setLevelInput = document.getElementById(`setLevelInput-${shaftId}`);
        const setLevel = setLevelInput.value;
        console.log(`Setting level for shaft ${shaftId} to ${setLevel}`);
        const response = await fetch(`api/shaft/${shaftId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: setLevel
            })
        });
        const data = await response.json();
        console.log(data);
        // refresh table with updated data
        const fragment = window.location.hash.substring(1);

        build_input_html(fragment);
    }
});