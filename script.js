let currentPage = 1;
let totalPages = 1;

function getRepositories() {
    const username = document.getElementById('username').value.trim();
    const perPage = document.getElementById('perPage').value;
    const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;

    if (username === "") {
        alert("Please enter a GitHub username.");
        return;
    }

    $('#loader').removeClass('d-none');
    $('#repositories').empty();

    $.get(url)
        .done(function (data, textStatus, xhr) {
            const linkHeader = xhr.getResponseHeader('Link');
            totalPages = extractTotalPages(linkHeader);
            displayRepositories(data);
            updatePagination();
        })
        .fail(function () {
            alert('Error fetching repositories. Please try again.');
        })
        .always(function () {
            $('#loader').addClass('d-none');
        });

    // Fetch user details and display in the left
    $.get(`https://api.github.com/users/${username}`)
        .done(function (userData) {
            displayUserDetails(userData);
        })
        .fail(function () {
            console.log('Error fetching user details.');
        });
}

function displayRepositories(repositories) {
    const $repositoriesContainer = $('#repositories');

    if (repositories.length === 0) {
        $repositoriesContainer.append('<p>No repositories found.</p>');
    } else {
        repositories.forEach(repo => {
            // Fetch languages for each repository
            $.get(`https://api.github.com/repos/${repo.full_name}/languages`)
                .done(function (languages) {
                    const languageTags = Object.keys(languages).map(language => `<span class="tag badge">${language}</span>`).join('');
                    repo.description = repo.description || '';
                    const cardHtml = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${repo.name}</h5>
                                <p class="card-text">${repo.description}</p>
                                <div class="languages">
                                    ${languageTags}
                                </div>
                                <a href="${repo.html_url}" target="_blank" class="btn btn-dark border-0" style="background-color: #f88f33; padding:2 8px;">View on GitHub</a>
                            </div>
                        </div>
                    `;

                    $repositoriesContainer.append(cardHtml);
                })
                .fail(function () {
                    console.log('Error fetching languages for repository:', repo.name);
                });
        });
    }
}


function extractTotalPages(linkHeader) {
    if (!linkHeader) {
        return 1;
    }

    const matches = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return matches ? parseInt(matches[1]) : 1;
}

function updatePagination() {
    const $pagination = $('#pagination');
    $pagination.empty();

    for (let i = 1; i <= totalPages; i++) {
        const liClass = i === currentPage ? 'page-item active' : 'page-item';
        const aClass = 'page-link';

        const liHtml = `<li class="${liClass}"><a class="${aClass}" onclick="changePage(${i})">${i}</a></li>`;
        $pagination.append(liHtml);
    }

    if (currentPage > 1) {
        const prevHtml = `<li class="page-item"><a class="page-link" onclick="changePage(${currentPage - 1})">Previous</a></li>`;
        $pagination.prepend(prevHtml);
    }

    if (currentPage < totalPages) {
        const nextHtml = `<li class="page-item"><a class="page-link" onclick="changePage(${currentPage + 1})">Next</a></li>`;
        $pagination.append(nextHtml);
    }
}

function changePage(page) {
    currentPage = page;
    getRepositories();
}

function displayUserDetails(user) {
    const $userSection = $('#userSection');
    $userSection.empty();
    user.bio= user.bio || '';
    user.twitter = user.twitter || '';
    const userHtml = `
        <img src="${user.avatar_url}" alt="Profile Picture" class=" rounded-circle img-fluid mb-3">
        <h4>${user.name}</h4>
        <p>${user.bio}</p>
        <p>📍${user.location}</p>
        <p>${user.twitter}</p>
        <!-- Add other user details as needed -->
    `;

    $userSection.append(userHtml);
}

