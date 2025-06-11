// LeetCode Profile Comparison App
class LeetCodeComparison {
    constructor() {
        this.apiBaseUrl = 'https://leetcode-stats-api.herokuapp.com';
        this.userData = {};
        this.charts = {};
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const compareBtn = document.getElementById('compareBtn');
        const retryBtn = document.getElementById('retryBtn');
        const username1Input = document.getElementById('username1');
        const username2Input = document.getElementById('username2');
        const analyseBtn = document.getElementById('analyseBtn'); // <-- Add this line

        compareBtn?.addEventListener('click', () => this.handleCompare());
        retryBtn?.addEventListener('click', () => this.handleRetry());
        analyseBtn?.addEventListener('click', () => this.handleAnalyseProfile()); 
        // Allow Enter key to trigger comparison
        [username1Input, username2Input].forEach(input => {
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleCompare();
                }
            });
        });
    }

    async handleCompare() {
        const username1 = document.getElementById('username1').value.trim();
        const username2 = document.getElementById('username2').value.trim();

        if (!username1 || !username2) {
            this.showError('Please enter both usernames');
            return;
        }

        if (username1 === username2) {
            this.showError('Please enter different usernames');
            return;
        }

        this.showLoading();
        
        try {
            // Fetch data for both users
            const [user1Data, user2Data] = await Promise.all([
                this.fetchUserData(username1),
                this.fetchUserData(username2)
            ]);

            this.userData = {
                user1: user1Data,
                user2: user2Data
            };

            this.displayResults(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError(error.message || 'Failed to fetch user data. Please check the usernames and try again.');
        }
    }

    async handleAnalyseProfile() {
        const username = document.getElementById('username1').value.trim() || document.getElementById('username2').value.trim();
        if (!username) {
            this.showError('Please enter a username to analyse');
            return;
        }
        this.showLoading();
        try {
            const userData = await this.fetchUserData(username);
            this.userData = { user1: userData, user2: userData }; // Use the same data for both profiles
            this.displayResults(true);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            this.showError(error.message || 'Failed to fetch user data. Please check the username and try again.');
        }
    }


    async fetchUserData(username) {
        try {
            // Fetch profile data
            const profileResponse = await fetch(`${this.apiBaseUrl}/${username}`);
            if (!profileResponse.ok) {
                throw new Error(`User "${username}" not found`);
            }
            const profileData = await profileResponse.json();

            // Fetch solved problems data
            let solvedData = {};
            try {
                const solvedResponse = await fetch(`${this.apiBaseUrl}/${username}/solved`);
                if (solvedResponse.ok) {
                    solvedData = await solvedResponse.json();
                }
            } catch (e) {
                console.warn('Could not fetch solved data for', username);
            }

            // Fetch contest data
            let contestData = {};
            try {
                const contestResponse = await fetch(`${this.apiBaseUrl}/${username}/contest`);
                if (contestResponse.ok) {
                    contestData = await contestResponse.json();
                }
            } catch (e) {
                console.warn('Could not fetch contest data for', username);
            }

            // Combine all data
            return {
                username: username,
                name: profileData.name || username,
                avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${username}&background=667eea&color=fff&size=128`,
                ranking: profileData.ranking || 'N/A',
                reputation: profileData.reputation || 0,
                totalSolved: profileData.totalSolved || 0,
                totalQuestions: profileData.totalQuestions || 2500,
                easySolved: profileData.easySolved || 0,
                totalEasy: profileData.totalEasy || 600,
                mediumSolved: profileData.mediumSolved || 0,
                totalMedium: profileData.totalMedium || 1300,
                hardSolved: profileData.hardSolved || 0,
                totalHard: profileData.totalHard || 600,
                acceptanceRate: profileData.acceptanceRate || 0,
                contestRating: contestData.contestRating || 0,
                contestAttend: contestData.contestAttend || 0,
                solvedProblem: solvedData.solvedProblem || []
            };
        } catch (error) {
            throw new Error(`Failed to fetch data for user "${username}": ${error.message}`);
        }
    }

    showLoading() {
        this.hideAllSections();
        document.getElementById('loadingSection')?.classList.remove('hidden');
    }

    showError(message) {
        this.hideAllSections();
        const errorSection = document.getElementById('errorSection');
        const errorText = document.getElementById('errorText');
        
        if (errorSection && errorText) {
            errorText.textContent = message;
            errorSection.classList.remove('hidden');
        }
    }

    hideAllSections() {
        ['loadingSection', 'errorSection', 'resultsSection'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
    }

    handleRetry() {
        this.hideAllSections();
    }

    displayResults(isSingleProfile = false) {
        this.hideAllSections();
        document.getElementById('resultsSection')?.classList.remove('hidden');

        this.populateProfileCards(isSingleProfile);
        this.populateStatistics(isSingleProfile);
        this.createCharts(isSingleProfile);
    }

    populateProfileCards(isSingleProfile = false) {
    const { user1, user2 } = this.userData;

    // User 1 (always shown)
    this.setElementContent('avatar1', 'src', user1.avatar);
    this.setElementContent('name1', 'textContent', user1.name);
    this.setElementContent('username1Display', 'textContent', `@${user1.username}`);
    this.setElementContent('ranking1', 'textContent', this.formatNumber(user1.ranking));
    this.setElementContent('reputation1', 'textContent', this.formatNumber(user1.reputation));

    // User 2
    const profile2 = document.getElementById('user2Card');
    if (isSingleProfile) {
        if (profile2) profile2.style.display = 'none';
    } else {
        if (profile2) profile2.style.display = '';
        this.setElementContent('avatar2', 'src', user2.avatar);
        this.setElementContent('name2', 'textContent', user2.name);
        this.setElementContent('username2Display', 'textContent', `@${user2.username}`);
        this.setElementContent('ranking2', 'textContent', this.formatNumber(user2.ranking));
        this.setElementContent('reputation2', 'textContent', this.formatNumber(user2.reputation));
    }
}

populateStatistics(isSingleProfile = false) {
    const { user1, user2 } = this.userData;

    // Total Problems Solved
    const maxTotal = isSingleProfile ? user1.totalSolved : Math.max(user1.totalSolved, user2.totalSolved);
    this.setProgressBar('totalSolved1', user1.totalSolved, maxTotal);
    this.setElementContent('totalSolvedNum1', 'textContent', user1.totalSolved);

    const totalSolved2Bar = document.getElementById('totalSolved2');
    const totalSolved2Num = document.getElementById('totalSolvedNum2');
    if (isSingleProfile) {
        if (totalSolved2Bar) totalSolved2Bar.parentElement.parentElement.style.display = 'none'; // Hide User 2's stat-bar
    } else {
        if (totalSolved2Bar) totalSolved2Bar.parentElement.parentElement.style.display = '';
        this.setProgressBar('totalSolved2', user2.totalSolved, maxTotal);
        this.setElementContent('totalSolvedNum2', 'textContent', user2.totalSolved);
    }

    // Acceptance Rate
    this.setProgressBar('acceptanceRate1', user1.acceptanceRate, 100);
    this.setElementContent('acceptanceRateNum1', 'textContent', `${user1.acceptanceRate.toFixed(1)}%`);

    const acceptanceRate2Bar = document.getElementById('acceptanceRate2');
    const acceptanceRate2Num = document.getElementById('acceptanceRateNum2');
    if (isSingleProfile) {
        if (acceptanceRate2Bar) acceptanceRate2Bar.parentElement.parentElement.style.display = 'none';
    } else {
        if (acceptanceRate2Bar) acceptanceRate2Bar.parentElement.parentElement.style.display = '';
        this.setProgressBar('acceptanceRate2', user2.acceptanceRate, 100);
        this.setElementContent('acceptanceRateNum2', 'textContent', `${user2.acceptanceRate.toFixed(1)}%`);
    }

    // Contest Rating
    const maxRating = isSingleProfile ? user1.contestRating : Math.max(user1.contestRating, user2.contestRating, 2500);
    this.setProgressBar('contestRating1', user1.contestRating, maxRating);
    this.setElementContent('contestRatingNum1', 'textContent', user1.contestRating || 'N/A');

    const contestRating2Bar = document.getElementById('contestRating2');
    const contestRating2Num = document.getElementById('contestRatingNum2');
    if (isSingleProfile) {
        if (contestRating2Bar) contestRating2Bar.parentElement.parentElement.style.display = 'none';
    } else {
        if (contestRating2Bar) contestRating2Bar.parentElement.parentElement.style.display = '';
        this.setProgressBar('contestRating2', user2.contestRating, maxRating);
        this.setElementContent('contestRatingNum2', 'textContent', user2.contestRating || 'N/A');
    }
}

    setProgressBar(elementId, value, maxValue) {
        const element = document.getElementById(elementId);
        if (element && maxValue > 0) {
            const percentage = Math.min((value / maxValue) * 100, 100);
            element.style.width = `${percentage}%`;
        }
    }

    setElementContent(elementId, property, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element[property] = value;
        }
    }

  createCharts(isSingleProfile = false) {
    // Destroy existing charts
    Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    this.charts = {};

    // Hide/show user 2's pie chart and chart container
    const pie2 = document.getElementById('pieChart2');
    const chartContainer2 = pie2?.closest('.chart-container');
    if (isSingleProfile) {
        this.createUserPieChart('pieChart1', this.userData.user1, 1);
        if (pie2) pie2.style.display = 'none';
        if (chartContainer2) chartContainer2.style.display = 'none';
        this.createSingleDifficultyChart();
    } else {
        if (pie2) pie2.style.display = '';
        if (chartContainer2) chartContainer2.style.display = '';
        this.createDifficultyChart();
        this.createPieCharts();
    }
}

    createDifficultyChart() {
        const ctx = document.getElementById('difficultyChart');
        if (!ctx) return;

        const { user1, user2 } = this.userData;

        this.charts.difficulty = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [
                    {
                        label: user1.username,
                        data: [user1.easySolved, user1.mediumSolved, user1.hardSolved],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                        borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                        borderWidth: 1
                    },
                    {
                        label: user2.username,
                        data: [user2.easySolved, user2.mediumSolved, user2.hardSolved],
                        backgroundColor: ['#5D878F', '#DB4545', '#D2BA4C'],
                        borderColor: ['#5D878F', '#DB4545', '#D2BA4C'],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim()
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
                        }
                    }
                }
            }
        });
    }


    createSingleDifficultyChart() {
        const ctx = document.getElementById('difficultyChart');
        if (!ctx) return;

        const { user1 } = this.userData;

        this.charts.difficulty = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [
                    {
                        label: user1.username,
                        data: [user1.easySolved, user1.mediumSolved, user1.hardSolved],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                        borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim()
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
                        }
                    }
                }
            }
        });
    }

    createPieCharts() {
        this.createUserPieChart('pieChart1', this.userData.user1, 1);
        this.createUserPieChart('pieChart2', this.userData.user2, 2);
    }

    createUserPieChart(canvasId, userData, userNumber) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const total = userData.easySolved + userData.mediumSolved + userData.hardSolved;
        if (total === 0) {
            // Show empty state
            ctx.getContext('2d').font = '16px Arial';
            ctx.getContext('2d').textAlign = 'center';
            ctx.getContext('2d').fillText('No problems solved', ctx.width/2, ctx.height/2);
            return;
        }

        this.charts[`pie${userNumber}`] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [{
                    data: [userData.easySolved, userData.mediumSolved, userData.hardSolved],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    formatNumber(num) {
        if (num === 'N/A' || num === null || num === undefined) return 'N/A';
        if (typeof num === 'number') {
            return num.toLocaleString();
        }
        return num;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LeetCodeComparison();
});
