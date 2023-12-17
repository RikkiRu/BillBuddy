document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById("settingsModal");
    var btn = document.getElementById("settingsButton");
    var span = document.getElementsByClassName("close")[0];
    var itemsList = document.getElementById("itemsList");

    btn.onclick = function() {
        modal.style.display = "block";
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

        if (name && price) {
            var div = document.createElement('div');
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.setAttribute('data-price', price);

            var label = document.createElement('label');
            label.textContent = name + ' (' + price + ' руб.)';

            div.appendChild(checkbox);
            div.appendChild(label);
            itemsList.appendChild(div);

            document.getElementById('newItemName').value = '';
            document.getElementById('newItemPrice').value = '';
            modal.style.display = "none";
        }
    }

    document.getElementById("calculateTotalButton").onclick = function() {
        var checkboxes = document.querySelectorAll('#itemsList input[type=checkbox]:checked');
        var total = 0;
        checkboxes.forEach(function(checkbox) {
            total += parseInt(checkbox.getAttribute('data-price'));
        });
        document.getElementById('total').textContent = 'Итоговая сумма: ' + total + ' руб.';
    }
});
