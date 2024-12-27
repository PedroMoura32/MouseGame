// script.js
document.addEventListener('DOMContentLoaded', () => {
    const shapes = document.querySelectorAll('.shape');
    const feedback = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const instructionImage = document.getElementById('instruction-image');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    const questions = [
        {
            folder: 'triangle',
            correctShape: 'triangle'
        },
        {
            folder: 'circle',
            correctShape: 'circle'
        },
        {
            folder: 'square',
            correctShape: 'square'
        },
        {
            folder: 'rectangle',
            correctShape: 'rectangle'
        }
    ];

    let currentQuestionIndex = 0;

    function getRandomImage(folder) {
        const images = [
            `images/${folder}/${folder}1.png`,
            `images/${folder}/${folder}2.png`
        ];
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }

    function loadQuestion(index) {
        const question = questions[index];
        const imageSrc = getRandomImage(question.folder);
        instructionImage.src = imageSrc;
        shapes.forEach(shape => {
            shape.setAttribute('data-correct', shape.id === question.correctShape);
        });
        feedback.textContent = '';
        nextButton.style.display = 'none';
    }

    function handleShapeClick(event) {
        const shape = event.target;
        const isCorrect = shape.getAttribute('data-correct') === 'true';
        if (isCorrect) {
            feedback.textContent = 'Parabéns! Você acertou!';
            feedback.style.color = 'green';
            correctSound.play();
        } else {
            feedback.textContent = 'Tente novamente!';
            feedback.style.color = 'red';
            wrongSound.play();
        }
        nextButton.style.display = 'block';
    }

    function handleNextButtonClick() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion(currentQuestionIndex);
        } else {
            feedback.textContent = 'Parabéns! Você completou todas as perguntas!';
            feedback.style.color = 'green';
            nextButton.style.display = 'none';
        }
    }

    shapes.forEach(shape => {
        shape.addEventListener('click', handleShapeClick);
        shape.addEventListener('mouseover', () => {
            shape.style.backgroundColor = '#ffd700'; // Cor amarela ao passar o mouse
        });
        shape.addEventListener('mouseout', () => {
            shape.style.backgroundColor = '#ff6347'; // Volta à cor original
        });
    });

    nextButton.addEventListener('click', handleNextButtonClick);

    loadQuestion(currentQuestionIndex);
});
