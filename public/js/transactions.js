document.addEventListener('DOMContentLoaded', () => {
    const editModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    const editForm = document.getElementById('editTransactionForm');
    const saveEditBtn = document.getElementById('saveEditBtn');

    // Handle edit button clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-transaction-btn')) {
            const row = e.target.closest('tr');
            const id = row.dataset.id;
            const type = row.dataset.type;
            const amount = row.cells[2].textContent.replace('$', '');
            const description = row.cells[3].textContent.trim();

            // Populate modal
            document.getElementById('editTransactionId').value = id;
            document.getElementById('editType').value = type;
            document.getElementById('editAmount').value = amount;
            document.getElementById('editDescription').value = description;
            document.getElementById('editReason').value = '';

            editModal.show();
        }
    });

    // Handle save button click
    saveEditBtn.addEventListener('click', async () => {
        try {
            const id = document.getElementById('editTransactionId').value;
            const formData = {
                amount: parseFloat(document.getElementById('editAmount').value),
                description: document.getElementById('editDescription').value,
                editReason: document.getElementById('editReason').value
            };

            if (!formData.editReason) {
                throw new Error('Please provide a reason for editing');
            }

            const response = await fetch(`/api/transaction/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            // Update UI
            updateTransactionRow(result.transaction);
            updateBalance(result.newBalance);
            
            editModal.hide();
            showNotification('Transaction updated successfully', 'success');
        } catch (error) {
            console.error('Edit error:', error);
            showNotification(error.message, 'error');
        }
    });

    function updateTransactionRow(transaction) {
        const row = document.querySelector(`tr[data-id="${transaction.id}"]`);
        if (row) {
            row.cells[2].textContent = `$${parseFloat(transaction.amount).toFixed(2)}`;
            row.cells[3].innerHTML = `
                ${transaction.description}
                <small class="text-muted d-block">
                    <i class="bi bi-pencil-square"></i> Edited
                </small>
            `;
        }
    }

    function updateBalance(newBalance) {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `$${parseFloat(newBalance).toFixed(2)}`;
        }
    }
});
