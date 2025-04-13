$(document).ready(function() {
    $('#adminRegistrationForm').on('submit', function(e) {
        e.preventDefault();
        
        // Получаем значения полей
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const firstName = $('#firstName').val().trim();
        const lastName = $('#lastName').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        const notes = $('#notes').val().trim();
        
        // Проверяем совпадение паролей
        if (password !== confirmPassword) {
            showError('Пароли не совпадают');
            return;
        }
        
        // Проверяем длину пароля
        if (password.length < 6) {
            showError('Пароль должен содержать минимум 6 символов');
            return;
        }

        // Проверяем длину имени пользователя
        if (username.length < 3 || username.length > 50) {
            showError('Имя пользователя должно быть от 3 до 50 символов');
            return;
        }
        
        // Создаем объект с данными
        const adminData = {
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password,
            notes: notes
        };
        
        // Отправляем запрос на сервер
        $.ajax({
            url: '/api/register/admin',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(adminData),
            success: function(response) {
                // При успешной регистрации
                alert('Регистрация успешно завершена!');
                window.location.href = '../../login'; // Перенаправление на страницу входа
            },
            error: function(xhr) {
                // При ошибке
                const errorMessage = xhr.responseJSON?.message || 'Произошла ошибка при регистрации';
                showError(errorMessage);
            }
        });
    });
    
    function showError(message) {
        const errorDiv = $('#errorMessage');
        errorDiv.text(message);
        errorDiv.show();
        setTimeout(() => errorDiv.fadeOut(), 5000); // Скрываем сообщение через 5 секунд
    }
}); 