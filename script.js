document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    loadBalance();

    var modal = document.getElementById("settingsModal");
    var btn = document.getElementById("settingsButton");
    var span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
        modal.style.display = "block";
        loadSettingsItems();
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById("addNewItemButton").onclick = function() {
        var name = document.getElementById('newItemName').value;
        var price = document.getElementById('newItemPrice').value;
        var people = document.getElementById('newItemPeople').value || 1;

        if (name && price) {
            var items = JSON.parse(localStorage.getItem('items') || '[]');
            items.push({ name: name, price: parseFloat(price), people: parseInt(people) });
            localStorage.setItem('items', JSON.stringify(items));
            loadItems();
            loadSettingsItems();
        }
    }

    document.getElementById("updateBalanceButton").onclick = function() {
        var newBalance = parseFloat(document.getElementById('balanceInput').value);
        if (!isNaN(newBalance)) {
            localStorage.setItem('balance', newBalance);
            loadBalance();
        }
    }

    document.getElementById("calculateTotalButton").onclick = function() {
        calculateTotal();
    }

    document.getElementById("subtractFromBalanceButton").onclick = function() {
        var total = calculateTotal();
        var balance = parseFloat(localStorage.getItem('balance') || 0);
        balance -= total;
        localStorage.setItem('balance', balance);
        loadBalance();
    }
});

function loadItems() {
    var items = JSON.parse(localStorage.getItem('items') || '[]');
    var itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    items.forEach(function(item, index) {
        var div = document.createElement('div');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.price = item.price;
        checkbox.dataset.people = item.people;

        var label = document.createElement('label');
        label.textContent = item.name + ' (' + item.price + ' руб.)';

        var peopleInput = document.createElement('input');
        peopleInput.type = 'number';
        peopleInput.className = 'people-count';
        peopleInput.value = item.people;
        peopleInput.min = 1;
        peopleInput.onchange = function() {
            updateItemPeople(index, peopleInput.value);
        };

        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(peopleInput);
        itemsList.appendChild(div);
    });
}

function loadSettingsItems() {
    var items = JSON.parse(localStorage.getItem('items') || '[]');
    var settingsList = document.getElementById('settingsList');
    settingsList.innerHTML = '';
    items.forEach(function(item, index) {
        var div = document.createElement('div');
        div.className = 'settings-item';

        var span = document.createElement('span');
        span.textContent = item.name + ' (' + item.price + ' руб.) на ' + item.people + ' чел.';

        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.onclick = function() {
            deleteItem(index);
        };

        div.appendChild(span);
        div.appendChild(deleteButton);
        settingsList.appendChild(div);
    });
}

function loadBalance() {
    var balance = parseFloat(localStorage.getItem('balance') || 0);
    document.getElementById('balanceDisplay').textContent = balance.toFixed(2);
    document.getElementById('balanceDisplayModal').textContent = balance.toFixed(2);
}

function calculateTotal() {
    var total = 0;
    var items = document.querySelectorAll('#itemsList div');
    items.forEach(function(div) {
        var checkbox = div.querySelector('input[type=checkbox]');
        var peopleInput = div.querySelector('.people-count');
        if (checkbox.checked) {
            var price = parseFloat(checkbox.dataset.price);
            var people = parseInt(peopleInput.value) || 1;
            total += price / people;
        }
    });
    document.getElementById('total').textContent = 'Итоговая сумма: ' + total.toFixed(2) + ' руб.';
    return total;
}

function deleteItem(index) {
    var items = JSON.parse(localStorage.getItem('items') || '[]');
    items.splice(index, 1);
    localStorage.setItem('items', JSON.stringify(items));
    loadItems();
    loadSettingsItems();
}

function updateItemPeople(index, newPeople) {
    var items = JSON.parse(localStorage.getItem('items') || '[]');
    if (items[index]) {
        items[index].people = parseInt(newPeople);
        localStorage.setItem('items', JSON.stringify(items));
        loadItems();
    }
}
