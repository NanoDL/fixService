// Шаблоны профилей
export const customerProfileTemplate = `
<div class="profile-card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Информация профиля</h3>
        <button class="btn btn-sm btn-primary" id="editProfileBtn">
            <i class="bi bi-pencil"></i> Редактировать
        </button>
    </div>
    <div class="card-body">
        <form id="profileForm" class="d-none profile-form">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">Имя</label>
                    <input type="text" class="form-control" id="firstName" name="firstName">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Фамилия</label>
                    <input type="text" class="form-control" id="lastName" name="lastName">
                </div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" disabled>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Телефон</label>
                <input type="tel" class="form-control" id="phone" name="phone">
            </div>
            <div class="mb-3">
                <label for="address" class="form-label">Адрес</label>
                <input type="text" class="form-control" id="address" name="address">
            </div>
            <div class="mb-3">
                <label for="bio" class="form-label">О себе</label>
                <textarea class="form-control" id="bio" name="bio" rows="3"></textarea>
            </div>
            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" id="cancelEditBtn">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
        <div id="profileInfo">
            <div class="profile-info-item">
                <span class="profile-info-label">Полное имя:</span>
                <span class="profile-info-value" id="fullNameValue">Не указано</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Email:</span>
                <span class="profile-info-value" id="emailValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Телефон:</span>
                <span class="profile-info-value" id="phoneValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Адрес:</span>
                <span class="profile-info-value" id="addressValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">О себе:</span>
                <p class="profile-info-value" id="bioValue">Информация не заполнена</p>
            </div>
        </div>
    </div>
</div>
`;

export const masterProfileTemplate = `
<div class="profile-card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Профиль мастера</h3>
        <button class="btn btn-sm btn-primary" id="editProfileBtn">
            <i class="bi bi-pencil"></i> Редактировать
        </button>
    </div>
    <div class="card-body">
        <form id="profileForm" class="d-none profile-form">
            <div class="mb-3">
                <label for="masterName" class="form-label">Имя мастера/организации</label>
                <input type="text" class="form-control" id="masterName" name="masterName">
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" disabled>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Телефон</label>
                <input type="tel" class="form-control" id="phone" name="phone">
            </div>
            <div class="mb-3">
                <label for="address" class="form-label">Адрес</label>
                <input type="text" class="form-control" id="address" name="address">
            </div>
            <div class="mb-3">
                <label for="specialization" class="form-label">Специализация</label>
                <input type="text" class="form-control" id="specialization" name="specialization">
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="experience" class="form-label">Опыт работы (лет)</label>
                    <input type="number" class="form-control" id="experience" name="experience" min="0">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="price" class="form-label">Минимальная цена (₽)</label>
                    <input type="number" class="form-control" id="price" name="price" min="0">
                </div>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Описание услуг</label>
                <textarea class="form-control" id="description" name="description" rows="4"></textarea>
            </div>
            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" id="cancelEditBtn">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
        <div id="profileInfo">
            <div class="d-flex align-items-center mb-4">
                <div>
                    <span class="text-muted">Рейтинг:</span>
                    <span class="ms-2 fs-5 fw-bold" id="ratingValue">0.0</span>
                </div>
                <div class="ms-3" id="ratingStars">
                    <i class="bi bi-star"></i>
                    <i class="bi bi-star"></i>
                    <i class="bi bi-star"></i>
                    <i class="bi bi-star"></i>
                    <i class="bi bi-star"></i>
                </div>
            </div>

            <div class="profile-info-item">
                <span class="profile-info-label">Имя мастера/организации:</span>
                <span class="profile-info-value" id="masterNameValue">Не указано</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Специализация:</span>
                <span class="profile-info-value" id="specializationValue">Не указана</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Опыт работы:</span>
                <span class="profile-info-value" id="experienceValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Контактный email:</span>
                <span class="profile-info-value" id="emailValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Телефон:</span>
                <span class="profile-info-value" id="phoneValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Адрес:</span>
                <span class="profile-info-value" id="addressValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Стоимость услуг:</span>
                <span class="profile-info-value" id="priceValue">Не указана</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Описание услуг:</span>
                <p class="profile-info-value" id="descriptionValue">Информация не заполнена</p>
            </div>
        </div>
    </div>
</div>
`;

export const adminProfileTemplate = `
<div class="profile-card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Профиль администратора</h3>
        <button class="btn btn-sm btn-primary" id="editProfileBtn">
            <i class="bi bi-pencil"></i> Редактировать
        </button>
    </div>
    <div class="card-body">
        <form id="profileForm" class="d-none profile-form">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">Имя</label>
                    <input type="text" class="form-control" id="firstName" name="firstName">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Фамилия</label>
                    <input type="text" class="form-control" id="lastName" name="lastName">
                </div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" disabled>
            </div>
            <div class="mb-3">
                <label for="notes" class="form-label">Заметки</label>
                <textarea class="form-control" id="notes" name="notes" rows="3"></textarea>
            </div>
            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" id="cancelEditBtn">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
        <div id="profileInfo">
            <div class="profile-info-item">
                <span class="profile-info-label">Полное имя:</span>
                <span class="profile-info-value" id="fullNameValue">Не указано</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Email:</span>
                <span class="profile-info-value" id="emailValue">Не указан</span>
            </div>
            <div class="profile-info-item">
                <span class="profile-info-label">Заметки:</span>
                <p class="profile-info-value" id="notesValue">Нет заметок</p>
            </div>
        </div>
    </div>
</div>
`;

export const adminUsersTemplate = `
<div class="profile-card">
    <div class="card-header">
        <h3 class="mb-0">Управление пользователями</h3>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дата регистрации</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr>
                        <td colspan="7" class="text-center py-4">
                            <i class="bi bi-people text-muted d-block mb-3" style="font-size: 2rem;"></i>
                            Нет данных о пользователях
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <nav aria-label="Навигация по страницам пользователей" class="mt-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="me-2">Размер страницы:</span>
                    <select id="pageSizeSelect" class="form-select form-select-sm d-inline-block w-auto">
                        <option value="5">5</option>
                        <option value="10" selected>10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <ul class="pagination" id="usersPagination">
                    <li class="page-item disabled">
                        <a class="page-link" href="#" aria-label="Предыдущая">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                    <li class="page-item disabled">
                        <a class="page-link" href="#" aria-label="Следующая">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</div>
`;

export const adminStatsTemplate = `
<div class="profile-card">
    <div class="card-header">
        <h3 class="mb-0">Статистика системы</h3>
    </div>
    <div class="card-body">
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                        <h5 class="text-muted mb-1">Пользователей</h5>
                        <h2 class="mb-0" id="usersCount">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                        <h5 class="text-muted mb-1">Заказов</h5>
                        <h2 class="mb-0" id="ordersCount">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                        <h5 class="text-muted mb-1">Мастеров</h5>
                        <h2 class="mb-0" id="mastersCount">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                        <h5 class="text-muted mb-1">Заказчиков</h5>
                        <h2 class="mb-0" id="customersCount">0</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`; 