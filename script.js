document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    loadBalance();
    loadHistory();
    loadTipPercentage();

    var modal = document.getElementById("settingsModal");
    var historyModal = document.getElementById("historyModal");
    var btn = document.getElementById("settingsButton");
    var historyBtn = document.getElementById("historyButton");
    var span = document.getElementsByClassName("close")[0];
    var closeHistorySpan = document.getElementsByClassName("close-history")[0];

    btn.onclick = function() {
        modal.style.display = "block";
        loadSettingsItems();
    }

    historyBtn.onclick = function() {
        historyModal.style.display = "block";
        loadHistory();
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    closeHistorySpan.onclick = function() {
        historyModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal || event.target == historyModal) {
            modal.style.display = "none";
            historyModal.style.display = "none";
        }
    }

    document.getElementById("addNewItemButton").onclick = addNewItem;
    document.getElementById("updateBalanceButton").onclick = updateBalance;
    document.getElementById("updateTipButton").onclick = updateTipPercentage;
    document.getElementById("calculateTotalButton").onclick = calculateTotalWithTips;
    document.getElementById("subtractFromBalanceButton").onclick = subtractFromBalance;
    document.getElementById("clearHistoryButton").onclick = clearHistory;
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
        label.textContent = item.name + ' (' + item.price + ') / ';

        var peopleInput = document.createElement('input');
        peopleInput.type = 'number';
        peopleInput.className = 'people-count';
        peopleInput.value = item.people;
        peopleInput.min = 1;
        peopleInput.onchange = function() {
            updateItemPeople(index, peopleInput.value);
        };
        
        var labelQuantity = document.createElement('label');
        labelQuantity.textContent = ' quantity ';
        
        var quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity';
        
        if (Number.isInteger(item.quantity))
            quantityInput.value = item.quantity;
        else
            quantityInput.value = 1;
    
        quantityInput.min = 1;
        quantityInput.onchange = function() {
            updateItemQuantity(index, quantityInput.value);
        };

        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(peopleInput);
        div.appendChild(labelQuantity);
        div.appendChild(quantityInput);
        itemsList.appendChild(div);
    });
}

function addNewItem() {
    var name = document.getElementById('newItemName').value;
    var price = document.getElementById('newItemPrice').value;
    var people = document.getElementById('newItemPeople').value || 1;

    if (name && price) {
        var items = JSON.parse(localStorage.getItem('items') || '[]');
        items.push({ name: name, price: parseFloat(price), people: parseInt(people), quantity: 1 });
        localStorage.setItem('items', JSON.stringify(items));
        loadItems();
        loadSettingsItems();
    }
}

function loadSettingsItems() {
    var items = JSON.parse(localStorage.getItem('items') || '[]');
    var settingsList = document.getElementById('settingsList');
    settingsList.innerHTML = '';
    items.forEach(function(item, index) {
        var div = document.createElement('div');
        div.className = 'settings-item';

        var span = document.createElement('span');
        span.textContent = ' ' + item.name + ' (' + item.price + ') / ' + item.people + '';

        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteItem(index);
        };

        div.appendChild(deleteButton);
        div.appendChild(span);
        
        settingsList.appendChild(div);
    });
}

function updateBalance() {
    var newBalance = parseFloat(document.getElementById('balanceInput').value);
    if (!isNaN(newBalance)) {
        localStorage.setItem('balance', newBalance);
        loadBalance();
    }
}

function loadBalance() {
    var balance = parseFloat(localStorage.getItem('balance') || 0);
    document.getElementById('balanceDisplay').textContent = balance.toFixed(2);
    document.getElementById('balanceDisplayModal').textContent = balance.toFixed(2);
}

function updateTipPercentage() {
    var tipPercentage = parseFloat(document.getElementById('tipPercentage').value);
    if (!isNaN(tipPercentage)) {
        localStorage.setItem('tipPercentage', tipPercentage);
        loadTipPercentage();
    }
}

function loadTipPercentage() {
    var tipPercentage = parseFloat(localStorage.getItem('tipPercentage') || 0);
    document.getElementById('tipDisplay').textContent = tipPercentage + '%';
    document.getElementById('applyTip').checked = false;
}

function calculateTotal() {
    var total = 0;
    var items = document.querySelectorAll('#itemsList div');
    items.forEach(function(div) {
        var checkbox = div.querySelector('input[type=checkbox]');
        var peopleInput = div.querySelector('.people-count');
        var quantityInput = div.querySelector('.quantity');
        
        if (checkbox.checked) {
            var price = parseFloat(checkbox.dataset.price);
            var people = parseInt(peopleInput.value) || 1;
            var quantity = parseInt(quantityInput.value) || 1;
            total += price / people * quantity;
        }
    });
    return total;
}

function calculateTotalWithTips() {
    var total = calculateTotal();
    if (document.getElementById('applyTip').checked) {
        var tipPercentage = parseFloat(localStorage.getItem('tipPercentage') || 0);
        var tipAmount = total * (tipPercentage / 100);
        total += tipAmount;
    }
    document.getElementById('total').textContent = 'Sum: ' + total.toFixed(2) + '';
    return total;
}

function subtractFromBalance() {
    var total = calculateTotalWithTips();
    var balance = parseFloat(localStorage.getItem('balance') || 0);
    balance -= total;
    localStorage.setItem('balance', balance);
    saveTransaction(total);
    loadBalance();
    loadHistory();
}

function saveTransaction(total) {
    var history = JSON.parse(localStorage.getItem('history') || '[]');
    var date = new Date().toLocaleString();
    var involvedItems = Array.from(document.querySelectorAll('#itemsList div'))
                            .filter(div => div.querySelector('input[type=checkbox]').checked)
                            .map(div => {
                                var label = div.querySelector('label').textContent;
                                var peopleCount = div.querySelector('.people-count').value;
                                var quantity = div.querySelector('.quantity').value;
                                return `${label} / ${peopleCount} * ${quantity}`;
                            });

    if (document.getElementById('applyTip').checked) {
        var tipPercentage = parseFloat(localStorage.getItem('tipPercentage') || 0);
        involvedItems.push(`Tips: ${tipPercentage}%`);
    }

    history.push({ date: date, total: total.toFixed(2), items: involvedItems });
    localStorage.setItem('history', JSON.stringify(history));
}

function loadHistory() {
    var history = JSON.parse(localStorage.getItem('history') || '[]');
    var historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    history.forEach(function(entry) {
        var div = document.createElement('div');
        div.textContent = `${entry.date}: ${entry.total} - [${entry.items.join(', ')}]`;
        historyList.appendChild(div);
    });
}

function clearHistory() {
    localStorage.setItem('history', JSON.stringify([]));
    loadHistory();
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

function updateItemQuantity(index, newQuantity) {
    var items = JSON.parse(localStorage.getItem('items') || '[]');
    if (items[index]) {
        items[index].quantity = parseInt(newQuantity);
        localStorage.setItem('items', JSON.stringify(items));
        loadItems();
    }
}
