// ======== SCRIPT PRINCIPAL ========
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const themeToggle = document.getElementById('theme-toggle');

    // Function to apply the theme
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            themeToggle.checked = true;
        } else {
            themeToggle.checked = false;
        }
    };

    // Check for saved theme in localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Event listener for the toggle
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    
    // Sombra en el header al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Animación de aparición de secciones
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Animación de contadores para métricas
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 20);
    };

    // Observador para métricas
    const metricasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const valorElement = entry.target.querySelector('.metrica-valor');
                const target = parseInt(valorElement.getAttribute('data-target'));
                animateCounter(valorElement, target);
                metricasObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // Observar las tarjetas de métricas
    const metricasCards = document.querySelectorAll('.metrica-card');
    metricasCards.forEach(card => {
        metricasObserver.observe(card);
    });

    // Smooth scrolling para navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ======== CARGA DINÁMICA DE PROYECTOS ========
    const loadProjects = async () => {
        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const proyectosContainer = document.getElementById('proyectos-container');
            
            if (proyectosContainer && data.proyectos) {
                proyectosContainer.innerHTML = data.proyectos.map(proyecto => `
                    <div class="proyecto-card" data-project-id="${proyecto.id}">
                        <div class="proyecto-info">
                            <h3>${proyecto.titulo}</h3>
                            <p>${proyecto.descripcion}</p>
                            <div class="proyecto-links">
                                <a href="${proyecto.url_proyecto}" class="btn-proyecto btn-primario" target="_blank" rel="noopener noreferrer">Ver Proyecto</a>
                                <a href="${proyecto.url_github}" class="btn-proyecto btn-secundario" target="_blank" rel="noopener noreferrer" title="Ver código fuente">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                console.log('✅ Proyectos cargados exitosamente desde projects.json');
            }
        } catch (error) {
            console.error('❌ Error al cargar los proyectos:', error);
            // Fallback: mostrar mensaje de error en el contenedor
            const proyectosContainer = document.getElementById('proyectos-container');
            if (proyectosContainer) {
                proyectosContainer.innerHTML = `
                    <div class="error-message">
                        <p>No se pudieron cargar los proyectos. Por favor, verifica que el archivo data/projects.json esté disponible.</p>
                    </div>
                `;
            }
        }
    };

    // Cargar proyectos al inicializar la página
    loadProjects();

    // ======== CARGA DINÁMICA DE HABILIDADES ========
    const loadSkills = async () => {
        try {
            const response = await fetch('data/stack.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const habilidadesContainer = document.getElementById('habilidades-container');
            
            if (habilidadesContainer && data.categorias) {
                habilidadesContainer.innerHTML = data.categorias.map(categoria => `
                    <div class="habilidades-categoria">
                        <h3 class="categoria-titulo">${categoria.titulo}</h3>
                        <div class="habilidades-grid">
                            ${categoria.habilidades.map(habilidad => `
                                <div class="habilidad-item">
                                    ${habilidad.tipo === 'svg' ? `<img src="${habilidad.icono}" alt="${habilidad.nombre}">` : `<img src="${habilidad.icono}" alt="${habilidad.nombre}">`}
                                    <span>${habilidad.nombre}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                
                console.log('✅ Habilidades cargadas exitosamente desde stack.json');
            }
        } catch (error) {
            console.error('❌ Error al cargar las habilidades:', error);
            const habilidadesContainer = document.getElementById('habilidades-container');
            if (habilidadesContainer) {
                habilidadesContainer.innerHTML = `
                    <div class="error-message">
                        <p>No se pudieron cargar las habilidades. Por favor, verifica que el archivo data/stack.json esté disponible.</p>
                    </div>
                `;
            }
        }
    };

    // Cargar habilidades al inicializar la página
    loadSkills();

    // ======== CARGA DINÁMICA DE SERVICIOS BACKEND ========
    const loadServicios = async () => {
        try {
            const response = await fetch('data/servicios_backend.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const serviciosContainer = document.getElementById('servicios-container');
            
            if (serviciosContainer && data.servicios) {
                serviciosContainer.innerHTML = data.servicios.map(servicio => `
                    <div class="servicio-card" data-servicio-id="${servicio.id}">
                        <div class="servicio-icon">
                            <img src="${servicio.icono}" alt="${servicio.titulo}" onerror="this.style.display='none'">
                        </div>
                        <h3>${servicio.titulo}</h3>
                        <p>${servicio.descripcion}</p>
                        <div class="servicio-tags">
                            ${servicio.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('');
                
                console.log('✅ Servicios backend cargados exitosamente desde servicios_backend.json');
            }
        } catch (error) {
            console.error('❌ Error al cargar los servicios backend:', error);
            const serviciosContainer = document.getElementById('servicios-container');
            if (serviciosContainer) {
                serviciosContainer.innerHTML = `
                    <div class="error-message">
                        <p>No se pudieron cargar los servicios backend. Por favor, verifica que el archivo data/servicios_backend.json esté disponible.</p>
                    </div>
                `;
            }
        }
    };

    // Cargar servicios backend al inicializar la página
    loadServicios();

    // ======== CARGA DINÁMICA DE EXPERIENCIA LABORAL ========
    const loadExperience = async () => {
        try {
            const response = await fetch('data/experience.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const experienciaContainer = document.getElementById('experiencia-container');
            
            if (experienciaContainer && data.experiencia) {
                experienciaContainer.innerHTML = data.experiencia.map(exp => `
                    <div class="experiencia-item" data-experiencia-id="${exp.id}">
                        <div class="experiencia-empresa">${exp.empresa}</div>
                        <div class="experiencia-cargo">${exp.cargo}</div>
                        <div class="experiencia-fecha">${exp.fecha_inicio} - ${exp.fecha_fin}</div>
                        <div class="experiencia-descripcion">${exp.descripcion}</div>
                        <div class="experiencia-tecnologias">
                            ${exp.tecnologias.map(tech => `<span class="experiencia-tecnologia">${tech}</span>`).join('')}
                        </div>
                        <div class="experiencia-logros">
                            <h4>Logros Principales:</h4>
                            <ul>
                                ${exp.logros.map(logro => `<li>${logro}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('');
                
                console.log('✅ Experiencia laboral cargada exitosamente desde experience.json');
            }
        } catch (error) {
            console.error('❌ Error al cargar la experiencia laboral:', error);
            const experienciaContainer = document.getElementById('experiencia-container');
            if (experienciaContainer) {
                experienciaContainer.innerHTML = `
                    <div class="error-message">
                        <p>No se pudo cargar la experiencia laboral. Por favor, verifica que el archivo data/experience.json esté disponible.</p>
                    </div>
                `;
            }
        }
    };

    // Cargar experiencia laboral al inicializar la página
    loadExperience();
});
