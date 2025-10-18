document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------
    // Elementos del DOM
    // ------------------------------------------
    const cartList = document.getElementById('cart-list');
    const cartItemCountElement = document.getElementById('cart-item-count');
    const confirmLoanBtn = document.getElementById('confirm-loan-btn');
    
    // Si el script se carga en una página con carrito (categorías)
    if (cartList) {
        // Inicializar listeners y el contador al cargar la página
        updateCartDisplay(getCart());
        cartList.addEventListener('click', removeFromCart);
        confirmLoanBtn.addEventListener('click', confirmLoan);
        
        // Asegurar que el display se actualice cada vez que se abre el modal
        const cartModalElement = document.getElementById('cartModal');
        if (cartModalElement) {
            cartModalElement.addEventListener('show.bs.modal', () => {
                updateCartDisplay(getCart());
            });
        }
    }


    // ------------------------------------------
    // Funciones de LocalStorage
    // ------------------------------------------
    
    function getCart() {
        const cart = localStorage.getItem('loanCart');
        return cart ? JSON.parse(cart) : [];
    }

    function saveCart(cart) {
        localStorage.setItem('loanCart', JSON.stringify(cart));
        updateCartDisplay(cart);
    }

    // ------------------------------------------
    // Funciones de Carrito
    // ------------------------------------------

    // Esta función debe ser accesible globalmente desde el HTML (onclick)
    window.addToCart = function(button) {
        const title = button.getAttribute('data-title');
        const author = button.getAttribute('data-author');

        let cart = getCart();

        // Límite de 5 libros
        if (cart.length >= 5) {
            alert('No puedes solicitar más de 5 libros en un préstamo.');
            return;
        }

        // Prevenir duplicados (opcional)
        const isDuplicate = cart.some(book => book.title === title);
        if (isDuplicate) {
            alert(`"${title}" ya está en el carrito.`);
            return;
        }

        cart.push({ title, author });
        saveCart(cart);
        alert(`"${title}" agregado al carrito.`);
    }

    function removeFromCart(event) {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const indexToRemove = event.target.getAttribute('data-index');
            let cart = getCart();
            cart.splice(indexToRemove, 1);
            saveCart(cart);
        }
    }
    
    function updateCartDisplay(cart) {
        if (!cartList || !cartItemCountElement) return; 

        cartList.innerHTML = ''; 
        cartItemCountElement.textContent = cart.length;

        if (cart.length === 0) {
            cartList.innerHTML = '<li class="list-group-item text-muted" id="empty-cart-message">El carrito está vacío.</li>';
            confirmLoanBtn.setAttribute('disabled', 'true');
        } else {
            cart.forEach((book, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    ${book.title} <span class="text-muted small">(${book.author})</span>
                    <button class="btn btn-danger btn-sm remove-from-cart-btn" data-index="${index}">Quitar</button>
                `;
                cartList.appendChild(listItem);
            });
            confirmLoanBtn.removeAttribute('disabled');
        }
    }

    function confirmLoan() {
        let cart = getCart();
        if (cart.length === 0) {
            alert('El carrito está vacío. Agrega libros antes de confirmar.');
            return;
        }

        let confirmedLoans = localStorage.getItem('confirmedLoans');
        confirmedLoans = confirmedLoans ? JSON.parse(confirmedLoans) : [];

        // Definir las fechas de préstamo (Hoy y Vencimiento en 14 días)
        const today = new Date();
        const loanDate = today.toLocaleDateString('es-ES');
        const dueDateObj = new Date(today);
        dueDateObj.setDate(today.getDate() + 14);
        const dueDate = dueDateObj.toLocaleDateString('es-ES');

        // Mover cada libro del carrito a la lista de préstamos confirmados
        cart.forEach(book => {
            confirmedLoans.push({
                title: book.title,
                loanDate: loanDate,
                dueDate: dueDate,
                id: Date.now() + Math.random() 
            });
        });

        // Guardar la nueva lista de préstamos y limpiar el carrito
        localStorage.setItem('confirmedLoans', JSON.stringify(confirmedLoans));
        saveCart([]); // Limpiar el carrito
        
        // Cerrar el modal (si está abierto) y redirigir
        const modalElement = document.getElementById('cartModal');
        if (modalElement) {
             const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
             modal.hide();
        }
        
        alert(`¡Préstamo de ${cart.length} libros confirmado! Serás dirigido a "Mi Panel".`);
        window.location.href = 'usuarioprincipal.html';
    }
});