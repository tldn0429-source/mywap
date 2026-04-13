// Scroll Reveal Animation (For index - only runs if .reveal elements exist)
document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        reveals.forEach((reveal) => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Trigger once on load
});

// -------------------------------------------------------------
// Freeboard CRUD Logic (Using LocalStorage)
// -------------------------------------------------------------

// Post Template Structure
// { id: number, author: string, content: string, pwd: string, date: string }

const STORAGE_KEY = 'siwoo_portfolio_freeboard_v2';

function getPosts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        { id: 1, author: 'Senior Engineer', content: '기구학 해석 기반의 예방 정비 접근법이 매우 인상적입니다. 실무에도 큰 도움이 될 것 같네요.', pwd: '0429', date: new Date().toLocaleDateString() },
        { id: 2, author: 'Tech Lead', content: 'TRIZ 방법론을 하드웨어 설계에 적용한 사례가 참신합니다. 향후 AGV 설계 과정에 대해 더 이야기해보고 싶습니다.', pwd: '0429', date: new Date().toLocaleDateString() }
    ];
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function renderBoard() {
    const container = document.getElementById("board-container");
    if (!container) return; // Only run on board.html

    const posts = getPosts();
    container.innerHTML = "";

    if (posts.length === 0) {
        container.innerHTML = "<p class='text-gray'>등록된 글이 없습니다. 첫 번째 글을 남겨주세요!</p>";
        return;
    }

    // Sort newest first
    posts.sort((a,b) => b.id - a.id).forEach(post => {
        const item = document.createElement("div");
        item.classList.add("post-item", "card", "mb-10");
        item.style.padding = "20px";
        item.style.marginBottom = "15px";
        item.style.borderLeft = "4px solid var(--primary-color)";
        
        item.innerHTML = `
            <div style="display:flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin:0; color: var(--dark-gray);"><i class="fas fa-user-circle"></i> ${post.author}</h4>
                    <span class="text-gray" style="font-size: 0.8rem;">${post.date}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" onclick="promptPassword(${post.id}, 'edit')">수정</button>
                    <button class="btn btn-sm btn-danger" style="padding: 5px 10px; font-size: 0.8rem; background: #dc3545; color: white;" onclick="promptPassword(${post.id}, 'delete')">삭제</button>
                </div>
            </div>
            <p style="margin-top: 15px; white-space: pre-wrap;">${post.content}</p>
        `;
        container.appendChild(item);
    });
}

// Ensure board renders on page load if container exists
document.addEventListener("DOMContentLoaded", renderBoard);

// Modal Functions
function openWriteModal() {
    document.getElementById("modal-title").innerText = "새 글 작성";
    document.getElementById("post-author").value = "";
    document.getElementById("post-password").value = "";
    document.getElementById("post-content").value = "";
    document.getElementById("post-id").value = "";
    document.getElementById("boardModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("boardModal").style.display = "none";
}

function openEditModal(post) {
    document.getElementById("modal-title").innerText = "글 수정";
    document.getElementById("post-author").value = post.author;
    document.getElementById("post-password").value = post.pwd;
    document.getElementById("post-content").value = post.content;
    document.getElementById("post-id").value = post.id;
    document.getElementById("boardModal").style.display = "flex";
}

function savePost() {
    const author = document.getElementById("post-author").value.trim();
    const pwd = document.getElementById("post-password").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const id = document.getElementById("post-id").value;

    if (!author || !pwd || !content) {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    const posts = getPosts();

    if (id) {
        // Edit mode
        const index = posts.findIndex(p => p.id == id);
        if (index !== -1) {
            posts[index] = { ...posts[index], author, pwd, content };
        }
    } else {
        // Create mode
        const newPost = {
            id: Date.now(),
            author,
            content,
            pwd,
            date: new Date().toLocaleDateString()
        };
        posts.push(newPost);
    }

    savePosts(posts);
    closeModal();
    renderBoard();
}

// Password Verification Logic
function promptPassword(id, action) {
    document.getElementById("pwd-action-type").value = action;
    document.getElementById("pwd-post-id").value = id;
    document.getElementById("confirm-pwd").value = "";
    document.getElementById("pwdModal").style.display = "flex";
}

function closePwdModal() {
    document.getElementById("pwdModal").style.display = "none";
}

function verifyPassword() {
    const id = document.getElementById("pwd-post-id").value;
    const action = document.getElementById("pwd-action-type").value;
    const pwd = document.getElementById("confirm-pwd").value;
    
    if(!pwd) {
        alert("비밀번호를 입력해주세요.");
        return;
    }

    const posts = getPosts();
    const post = posts.find(p => p.id == id);

    if (post && post.pwd === pwd) {
        closePwdModal();
        if (action === 'edit') {
            openEditModal(post);
        } else if (action === 'delete') {
            const newPosts = posts.filter(p => p.id != id);
            savePosts(newPosts);
            renderBoard();
        }
    } else {
        alert("비밀번호가 일치하지 않습니다.");
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modal1 = document.getElementById('boardModal');
    const modal2 = document.getElementById('pwdModal');
    if (event.target == modal1) {
        modal1.style.display = "none";
    }
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
}
