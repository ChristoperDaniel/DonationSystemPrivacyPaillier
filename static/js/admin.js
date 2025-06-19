document.addEventListener('DOMContentLoaded', function() {
    // Animate numbers counting up
    animateNumbers();
    
    // Add hover effects to donor items
    addDonorItemAnimations();
    
});

function animateNumbers() {
    const totalElement = document.querySelector('.stats h2');
    if (!totalElement) return;
    
    const finalValue = totalElement.textContent;
    const numericValue = parseFloat(finalValue.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(numericValue)) return;
    
    let currentValue = 0;
    const increment = numericValue / 50; // Animate over 50 steps
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;
    
    totalElement.textContent = '0.00';
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
        }
        totalElement.textContent = currentValue.toFixed(2);
    }, stepTime);
}

function addDonorItemAnimations() {
    const donorItems = document.querySelectorAll('.donor-item, .admin-list li');
    
    donorItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
        
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function refreshData() {
    const refreshBtn = document.querySelector('.nav-btn[onclick*="refresh"]');
    if (!refreshBtn) return;
    
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    
    // Add spinning animation to refresh icon
    refreshBtn.style.animation = 'spin 1s linear infinite';
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

document.getElementById("show-decrypted").addEventListener("click", function() {
  fetch("/admin/decrypt")
    .then(response => response.json())
    .then(data => {
      const formatted = new Intl.NumberFormat('id-ID').format(data.total);
      document.getElementById("decrypted-value").innerText = `Rp ${formatted}`;
      document.getElementById("decrypted-modal").classList.remove("hidden");
    });
});

document.querySelector(".close-button").addEventListener("click", function() {
  document.getElementById("decrypted-modal").classList.add("hidden");
});

window.addEventListener("click", function(event) {
  const modal = document.getElementById("decrypted-modal");
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

