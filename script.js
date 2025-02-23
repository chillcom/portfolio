// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        const target = document.querySelector(href);
        const offset = 100; // ヘッダーの高さ分を考慮
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// スクロールアニメーション
const animateOnScroll = () => {
    const sections = document.querySelectorAll('.section');
    const triggerBottom = window.innerHeight * 0.8;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        
        if (sectionTop < triggerBottom) {
            section.classList.add('visible');
        }
    });
};

// 初期表示時のアニメーション
document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み直後のアニメーション
    setTimeout(animateOnScroll, 100);
    
    // スクロールイベントの登録（パフォーマンス最適化）
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            animateOnScroll();
        });
    });
});

// ヘッダーの透明度制御
const header = document.querySelector('.header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // 下スクロール時
        header.style.transform = 'translateY(-100%)';
    } else {
        // 上スクロール時
        header.style.transform = 'translateY(0)';
    }
    
    // ヘッダーの背景透明度制御
    const opacity = Math.min(scrollTop / 200, 0.95);
    header.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    
    lastScrollTop = scrollTop;
});

// カードのホバーエフェクト
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// フォームバリデーションと送信処理
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validatePhone = (phone) => {
    return phone === '' || phone.match(/^[0-9-]{10,}$/);
};

const showError = (field, message) => {
    const errorDiv = document.getElementById(`${field.id}Error`);
    errorDiv.textContent = message;
    field.classList.add('error');
};

const clearError = (field) => {
    const errorDiv = document.getElementById(`${field.id}Error`);
    errorDiv.textContent = '';
    field.classList.remove('error');
};

const validateField = (field) => {
    clearError(field);

    if (field.required && !field.value.trim()) {
        showError(field, '必須項目です');
        return false;
    }

    if (field.type === 'email' && !validateEmail(field.value)) {
        showError(field, '有効なメールアドレスを入力してください');
        return false;
    }

    if (field.type === 'tel' && !validatePhone(field.value)) {
        showError(field, '有効な電話番号を入力してください');
        return false;
    }

    return true;
};

// リアルタイムバリデーション
contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
            validateField(field);
        }
    });
});

// Firebaseの設定
// 注意: 以下の設定は実際のFirebase Consoleから取得した値に置き換える必要があります
const firebaseConfig = {
    apiKey: "AIzaSyDHnsH9Rtq9VKjwVzeAV-ZDWlfxLfGrx5o",
    authDomain: "portfolio-chill.firebaseapp.com",
    projectId: "portfolio-chill",
    storageBucket: "portfolio-chill.firebasestorage.app",
    messagingSenderId: "867093752174",
    appId: "1:867093752174:web:89d01677491b18bb33f97f"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// お問い合わせフォームの送信処理
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    // 全フィールドのバリデーション
    contactForm.querySelectorAll('input, textarea').forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    if (!isValid) return;

    // フォームデータの収集
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Firestoreにデータを保存
        await db.collection('inquiries').add(data);
        
        // 送信成功時の処理
        contactForm.reset();
        contactForm.style.display = 'none';
        formSuccess.hidden = false;

        // 3秒後にフォームを再表示
        setTimeout(() => {
            formSuccess.hidden = true;
            contactForm.style.display = 'block';
        }, 3000);
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        alert('送信に失敗しました。もう一度お試しください。');
    }
});

// クリッカブル画像の処理
const initializeClickableImages = () => {
    const images = document.querySelectorAll('.clickable-image');
    
    images.forEach(image => {
        // キーボードアクセシビリティの設定
        image.setAttribute('tabindex', '0');
        image.setAttribute('role', 'button');
        
        // インタラクションハンドラー
        const handleInteraction = async (e) => {
            // キーボードイベントの場合はEnterキーのみ処理
            if (e.type === 'keydown' && e.key !== 'Enter') return;
            
            e.preventDefault();
            const url = image.dataset.url;
            if (!url) return;

            // クリックエフェクトの適用
            image.classList.add('clicked');
            
            // アニメーション完了を待つ
            await new Promise(resolve => {
                image.addEventListener('animationend', () => {
                    resolve();
                }, { once: true });
            });
            
            // ページ遷移
            window.location.href = url;
        };

        // イベントリスナーの設定
        image.addEventListener('click', handleInteraction);
        image.addEventListener('keydown', handleInteraction);
        
        // フォーカス管理
        image.addEventListener('focus', () => {
            image.style.outline = '3px solid #666';
            image.style.outlineOffset = '2px';
        });
        
        image.addEventListener('blur', () => {
            image.style.outline = '';
            image.style.outlineOffset = '';
        });
        
        // タッチデバイスのサポート
        if ('ontouchstart' in window) {
            image.addEventListener('touchstart', () => {
                image.style.transform = 'scale(0.98)';
            });
            
            image.addEventListener('touchend', () => {
                image.style.transform = '';
            });
        }
    });
};

// DOMの読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', initializeClickableImages);

// 動的に追加された要素のための監視
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('clickable-image')) {
                    initializeClickableImages();
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
