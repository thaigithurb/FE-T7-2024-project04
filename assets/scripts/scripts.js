import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded, get, child, onChildRemoved } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js';


const firebaseConfig = {
    apiKey: "AIzaSyCMlu403WA0TlFltVEfUB4X_5Za2OPvnJo",
    authDomain: "project4chat.firebaseapp.com",
    databaseURL: "https://project4chat-default-rtdb.firebaseio.com",
    projectId: "project4chat",
    storageBucket: "project4chat.firebasestorage.app",
    messagingSenderId: "724820872505",
    appId: "1:724820872505:web:964a089f1b27f87e252ce8",
    measurementId: "G-B6MCX9BF1R"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(getDatabase());
const auth = getAuth();
const provider = new GoogleAuthProvider();
const chatsRef = ref(db, 'chats');

const buttonLogin = document.querySelector(".button-login");
const buttonRegister = document.querySelector(".button-register");
const buttonLogout = document.querySelector(".button-logout");
const buttonGoogle = document.querySelector(".google-login");
const chatAppRoom = document.querySelector(".chat-app__room");
const chatAppChat = document.querySelector(".chat-app__chat");
const chatAppFoot = document.querySelector(".chat-app__foot");
const empty = document.querySelector(".chat-app .empty");
const chat = document.querySelector(".chat-app .chat");
let currentUser = null;
let lastIncomingUserId = null;

// kiểm tra trạng thái
onAuthStateChanged(auth, (user) => {
    if (user) { 
        currentUser = user;
        buttonLogout.style.display = "block";
        chat.style.display = "block";
        buttonLogin.style.display = "none";
        buttonRegister.style.display = "none";
        empty.style.display = "none";
        // ...
    } else {
        setInterval(() => {
            empty.style.display = "flex";
        }, 1000);
        buttonLogin.style.display = "block";
        buttonRegister.style.display = "block";
    }
});
// Hết kiểm tra trạng thái

// đăng kí với email và mật khẩu
const registerForm = document.querySelector("#register-form");
if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = registerForm.name.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        if (fullName && email && password) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (user) {
                        set(ref(db, `users/${user.uid}`), {
                            fullName: fullName,
                            password: password
                        });
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Bạn đã đăng kí thành công",
                            showConfirmButton: false,
                            timer: 1000
                        })
                            .then(() => {
                                window.location.href = "index.html";
                            })
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Email đã tồn tại!",
                        // footer: '<a href="#">Why do I have this issue?</a>'
                    });
                });
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Vui lòng nhập đầy đủ thông tin!",
                // footer: '<a href="#">Why do I have this issue?</a>'
            });
        }

    })
}
// Hết đăng kí với email và mật khẩu

// đăng nhập với email và mật khẩu
const loginForm = document.querySelector("#login-form");
if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    if (user) {
                        loginForm.email.value = "";
                        loginForm.password.value = "";
                        const Toast = Swal.mixin({
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 1000,
                            // timerProgressBar: true,
                            didOpen: (toast) => {
                                toast.onmouseenter = Swal.stopTimer;
                                toast.onmouseleave = Swal.resumeTimer;
                            }
                        });
                        Toast.fire({
                            icon: "success",
                            title: "Đăng nhập thành công"
                        })
                            .then(() => {
                                window.location.href = "index.html";
                            })
                    }
                    else {
                        console.log("no data available");
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Email hoặc mật khẩu không đúng!",
                        // footer: '<a href="#">Why do I have this issue?</a>'
                    });
                    const errorCode = error.code;
                    const errorMessage = error.message;
                });
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Vui lòng nhập đầy đủ thông tin!",
                // footer: '<a href="#">Why do I have this issue?</a>'
            });
        }
    })
}
// Hết đăng nhập với email và mật khẩu

// Đăng nhập với google
if (buttonGoogle) {
    buttonGoogle.addEventListener("click", () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;

                if (user) {
                    // Lưu thông tin người dùng vào Firebase
                    const userRef = ref(db, 'users/' + user.uid);
                    set(userRef, {
                        fullName: user.displayName,
                        email: user.email,
                        profilePicture: user.photoURL
                    }).then(() => {
                        const Toast = Swal.mixin({
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 800,
                            // timerProgressBar: true,
                            didOpen: (toast) => {
                                toast.onmouseenter = Swal.stopTimer;
                                toast.onmouseleave = Swal.resumeTimer;
                            }
                        });
                        Toast.fire({
                            icon: "success",
                            title: "Đăng nhập thành công"
                        }).then(() => {
                            window.location.href = "index.html";
                        });
                    }).catch((error) => {
                        console.error("Error saving user data:", error);
                    });
                } else {
                    console.log("No user data available");
                }
            }).catch((error) => {
                console.error("Error during Google sign-in:", error);
            });
    });
}
// if (buttonGoogle) {
//     buttonGoogle.addEventListener("click", () => {
//         signInWithPopup(auth, provider)
//             .then((result) => {
//                 const credential = GoogleAuthProvider.credentialFromResult(result);
//                 const token = credential.accessToken;
//                 const user = result.user;
//                 if (user) {
//                     const Toast = Swal.mixin({
//                         toast: true,
//                         position: "top-end",
//                         showConfirmButton: false,
//                         timer: 800,
//                         // timerProgressBar: true,
//                         didOpen: (toast) => {
//                             toast.onmouseenter = Swal.stopTimer;
//                             toast.onmouseleave = Swal.resumeTimer;
//                         }
//                     });
//                     Toast.fire({
//                         icon: "success",
//                         title: "Đăng nhập thành công"
//                     })
//                         .then(() => {
//                             window.location.href = "index.html";
//                         })
//                 }
//                 else {
//                     console.log("no data available");
//                 }

//             }).catch((error) => {

//                 const errorCode = error.code;
//                 const errorMessage = error.message;

//                 const email = error.customData.email;

//                 const credential = GoogleAuthProvider.credentialFromError(error);
//                 // ...
//             });
//     })
// }
// Hết Đăng nhập với google


// Đăng xuất
if (buttonLogout) {
    buttonLogout.addEventListener("click", () => {
        signOut(auth).then(() => {
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1000,
                // timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "success",
                title: "Đăng xuất thành công"
            })
                .then(() => {
                    window.location.href = "index.html";
                })
        }).catch((error) => {
            // An error happened.
        });
    })
}
// Hết Đăng xuất

// form chat
const chatForm = document.querySelector(".chat-app__foot-form");
const url = 'https://api.cloudinary.com/v1_1/hzxyensd5/image/upload';
const inputChat = document.querySelector(".chat-app__foot-form input[name='content']");

if (chatForm) {
    // image preview
    const upload = new FileUploadWithPreview.FileUploadWithPreview('image-upload', {
        maxFileCount: 6,
        multiple: true
    });

    const buttonImage = document.querySelector(".chat-app__foot-form .button-image");
    const customFileContainer = document.querySelector(".custom-file-container");
    if (buttonImage && customFileContainer) {
        buttonImage.addEventListener("click", () => {
            customFileContainer.style.marginTop = "5px";
        });
    }
    // hết image preview

    chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const content = chatForm.content.value;
        const userId = auth.currentUser.uid;

        const imagesUpload = upload.cachedFileArray;

        if ((content || imagesUpload.length > 0) && userId) {

            const imagesLink = [];

            if (imagesUpload.length > 0) {

                const url = 'https://api.cloudinary.com/v1_1/drwdfsjes/image/upload';
                const formData = new FormData();

                for (let i = 0; i < imagesUpload.length; i++) {
                    let file = imagesUpload[i];
                    formData.append('file', file);
                    formData.append('upload_preset', 'vxx4clnr');

                    await fetch(url, {
                        method: 'POST',
                        body: formData,
                    })
                        .then((response) => {
                            return response.json();
                        })
                        .then((data) => {
                            imagesLink.push(data.url);
                        });
                }
            }

            set(push(ref(db, "chats")), {
                content: content,
                images: imagesLink,
                userId: userId
            });
        }
        inputChat.focus();
        upload.resetPreviewPanel(); // clear all selected images
        chatForm.content.value = "";
    })
}
// Hết form chat

// hiển thị tin nhắn mặc định
const chatBody = document.querySelector("[chat] .chat-app__chat--body");
if (chatBody) {
    onChildAdded(chatsRef, (data) => {
        const userId = data.val().userId;
        const key = data.key;
        const content = data.val().content;
        const images = data.val().images;

        get(child(dbRef, `users/${userId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const fullName = snapshot.val().fullName;
                const newChat = document.createElement("div");
                newChat.setAttribute("chat-key", key);

                let htmlButtonDelete = "";
                let htmlContent = "";
                let htmlImages = "";

                if (auth.currentUser) {
                    if (userId === currentUser.uid) {
                        newChat.classList.add("chat-app__chat--body-outgoing");
                        htmlButtonDelete = `
                            <button class="button-delete">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        `;
                        if (content) {
                            htmlContent = `
                                <div class="chat-app__chat--body-outgoing-content">
                                    ${content}
                                    ${htmlButtonDelete}
                                </div>
                            `;
                            newChat.innerHTML = `
                                ${htmlContent}
                            `;
                        }
                        if (images && images.length > 0) {
                            htmlImages += `<div class="chat-app__chat--body-image">`;

                            for (let i of images) {
                                htmlImages += `<img src="${i}"/>`;
                            }
                            htmlImages += `</div>`;

                            newChat.innerHTML = `
                                ${htmlImages}
                                ${htmlButtonDelete}
                            `;
                        }
                        lastIncomingUserId = null;
                    }
                    else {
                        newChat.classList.add("chat-app__chat--body-incoming");
                        let htmlFullName = '';
                        if (userId !== lastIncomingUserId) {
                            htmlFullName = `
                                <div class="chat-app__chat--body-incoming-name">${fullName}</div>
                            `;
                            lastIncomingUserId = userId;
                        }

                        if (content) {
                            htmlContent = `
                                <div class="chat-app__chat--body-outgoing-content">
                                    ${content}
                                    ${htmlButtonDelete}
                                </div>
                            `;
                            newChat.innerHTML = `
                                ${htmlFullName}
                                <div class="chat-app__chat--body-incoming-content">
                                    ${content}
                                </div>
                            `;
                        }
                        if (images && images.length > 0) {
                            htmlImages += `<div class="chat-app__chat--body-image">`;

                            for (let i of images) {
                                htmlImages += `<img src="${i}"/>`;
                            }
                            htmlImages += `</div>`;

                            newChat.innerHTML = `
                                ${htmlFullName}
                                ${htmlImages}
                                ${htmlButtonDelete}
                            `;
                        }
                    }
                }
                chatBody.appendChild(newChat);
                chatAppChat.scrollTop = chatAppChat.scrollHeight;

                // xóa tin nhắn
                const buttonDelete = newChat.querySelector(".button-delete");
                if (buttonDelete) {
                    buttonDelete.addEventListener("click", () => {
                        remove(ref(db, '/chats/' + key));
                    })
                }

                new Viewer(newChat);
            }
            else {
                console.log("no data available");
            }
        })
            .catch((error) => {
                console.error(error);
            });
    });
}
// Hết hiển thị tin nhắn mặc định

// Lắng nghe xem có tin nhắn nào bị xóa không
onChildRemoved(chatsRef, (data) => {
    const key = data.key;
    const chatItem = chatBody.querySelector(`[chat-key = "${key}"]`);
    if (chatItem) {
        chatItem.remove();
    }
});
// hết Lắng nghe xem có tin nhắn nào bị xóa không

// chèn icon
const emojiPicker = document.querySelector('emoji-picker');
if (emojiPicker) {
    const buttonIcon = document.querySelector(".chat-app__foot-form .button-icon");
    const tooltip = document.querySelector('.tooltip');
    Popper.createPopper(buttonIcon, tooltip);

    const iconSmile = document.querySelector(".chat-app__foot-form .button-icon i");

    buttonIcon.addEventListener("click", () => {
        tooltip.classList.toggle('shown');
    })

    const inputChat = document.querySelector(".chat-app__foot-form input[name='content']");
    emojiPicker.addEventListener("emoji-click", (event) => {
        const icon = event.detail.unicode;
        inputChat.value = inputChat.value + icon;
        inputChat.focus();
    })

    document.addEventListener("click", (event) => {
        if (!emojiPicker.contains(event.target) && (event.target != buttonIcon) && (event.target != iconSmile)) {
            tooltip.classList.remove('shown');
        }
    })
}
// Hết chèn icon


