class QuantumTrade {
    constructor() {
        this.init();
    }

    init() {
        this.setupParticles();
        this.setupAuthTabs();
        this.setupLanguage();
        this.setupAnimations();
    }

    setupParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: var(--quantum-cyan);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${10 + Math.random() * 20}s linear infinite;
            `;
            container.appendChild(particle);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(100vh) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupAuthTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                forms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${tabName}Form`) {
                        form.classList.add('active');
                    }
                });
            });
        });

        const urlParams = new URLSearchParams(window.location.search);
        const authType = urlParams.get('type');
        if (authType === 'register') {
            const registerTab = document.querySelector('[data-tab="register"]');
            if (registerTab) registerTab.click();
        }
    }

    setupLanguage() {
        const savedLang = localStorage.getItem('quantum_lang') || 'ru';
        this.applyLanguage(savedLang);
    }

    applyLanguage(lang) {
        localStorage.setItem('quantum_lang', lang);
        document.documentElement.lang = lang;
    }

    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .instrument-card, .value-card, .instruction-step').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // Функции торговли
    startTrading() {
        if (!this.checkAuth()) {
            window.location.href = 'auth.html?type=login';
            return;
        }
        alert('🚀 Запуск торгового терминала...');
     
    }

    openDemo() {
        alert('🎮 Демо-счет активирован!');
        
    }

    checkAuth() {
        return localStorage.getItem('quantum_user') !== null;
    }

    simulateMarketData() {
        const prices = document.querySelectorAll('.instrument-price');
        prices.forEach(priceEl => {
            setInterval(() => {
                const change = (Math.random() - 0.5) * 4;
                const newValue = Math.max(0.1, parseFloat(priceEl.textContent) + change);
                priceEl.textContent = `${change >= 0 ? '+' : ''}${newValue.toFixed(1)}%`;
                priceEl.style.color = change >= 0 ? 'var(--profit-green)' : 'var(--warning-red)';
            }, 3000);
        });
    }
}

class UserDB {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('quantum_users')) {
            localStorage.setItem('quantum_users', JSON.stringify([]));
        }
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('quantum_users'));

        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            balance: 10000,
            verified: false
        };

        users.push(newUser);
        localStorage.setItem('quantum_users', JSON.stringify(users));
        
        this.login(userData.email, userData.password);
        
        return { success: true, message: 'Регистрация успешна!', user: newUser };
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('quantum_users'));
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('quantum_user', JSON.stringify(user));
            return { success: true, message: 'Вход выполнен успешно!', user };
        } else {
            return { success: false, message: 'Неверный email или пароль' };
        }
    }

    logout() {
        localStorage.removeItem('quantum_user');
        return { success: true, message: 'Выход выполнен успешно!' };
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('quantum_user'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.quantumApp = new QuantumTrade();
    window.userDB = new UserDB();
    
    if (document.querySelector('.instrument-price')) {
        window.quantumApp.simulateMarketData();
    }
    
    setupAuthForms();
});

function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;

            const result = userDB.login(email, password);
            showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;

            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают!', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('Пароль должен содержать минимум 6 символов', 'error');
                return;
            }

            const result = userDB.register({ name, email, password });
            showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            }
        });
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.quantum-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `quantum-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .quantum-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                min-width: 300px;
                background: rgba(15, 20, 32, 0.95);
                border: 1px solid;
                border-radius: 10px;
                padding: 1rem;
                color: white;
                animation: slideInRight 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .quantum-notification.success { border-color: var(--profit-green); }
            .quantum-notification.error { border-color: var(--warning-red); }
            .quantum-notification.info { border-color: var(--quantum-cyan); }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: auto;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

function selectLanguage(lang) {
    localStorage.setItem('quantum_lang', lang);
    window.location.href = 'home.html';
}

function startTrading() {
    if (window.quantumApp) {
        window.quantumApp.startTrading();
    }
}

    function openTelegramBot() {
    window.open('https://t.me/AlfaSigBot', '_blank');

}

// Анимации для социальных карточек в терминале
class SocialAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupSocialCards();
        this.startSocialAnimations();
    }

    setupSocialCards() {
        const socialCards = document.querySelectorAll('.social-card');
        
        socialCards.forEach(card => {
            // Добавляем эффект при наведении
            card.addEventListener('mouseenter', () => {
                const emoji = card.querySelector('.social-emoji');
                if (emoji) {
                    emoji.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        emoji.style.transform = 'scale(1)';
                    }, 300);
                }
            });

            // Пульсация статуса онлайн
            const statusDot = card.querySelector('.status-dot');
            if (statusDot) {
                this.animateStatusDot(statusDot);
            }
        });
    }

    animateStatusDot(dot) {
        setInterval(() => {
            dot.style.opacity = dot.style.opacity === '0.5' ? '1' : '0.5';
        }, 1500);
    }

    startSocialAnimations() {
        // Анимация счетчиков подписчиков
        this.animateFollowerCounts();
        
        // Случайное мерцание карточек
        setInterval(() => {
            this.randomCardGlow();
        }, 5000);
    }

    animateFollowerCounts() {
        const followersElements = document.querySelectorAll('.followers');
        
        followersElements.forEach(element => {
            const originalText = element.textContent;
            setInterval(() => {
                // Случайное небольшое изменение числа подписчиков
                if (Math.random() > 0.7) {
                    const currentText = element.textContent;
                    const numbers = currentText.match(/\d+/g);
                    if (numbers) {
                        const newNumber = parseInt(numbers[0]) + (Math.random() > 0.5 ? 1 : -1);
                        element.textContent = currentText.replace(numbers[0], Math.max(25000, newNumber));
                        
                        // Возвращаем оригинальный текст через 2 секунды
                        setTimeout(() => {
                            element.textContent = originalText;
                        }, 2000);
                    }
                }
            }, 3000);
        });
    }

    randomCardGlow() {
        const cards = document.querySelectorAll('.social-card');
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        
        randomCard.style.animation = 'none';
        setTimeout(() => {
            randomCard.style.animation = '';
        }, 100);
    }
}

// Инициализация социальных анимаций
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.social-terminal')) {
        window.socialAnimations = new SocialAnimations();
    }
});