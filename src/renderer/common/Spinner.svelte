<script>

</script>

<div class="spinner">
    <svg class="spinner-inner" viewBox="0 0 16 16">
        <circle class="spinner-ring" cx="8px" cy="8px" r="7px"></circle>
        <circle class="spinner-fill" cx="8px" cy="8px" r="7px"></circle>
    </svg>
</div>

<style>
    .spinner {
        width: 32px;
        height: 32px;
        circle {
            fill: none;
            transform: rotate(-90deg);
            transition: all 0.2s ease-in-out;
            stroke-width: 2px;
            stroke-linecap: round;
            transform-origin: 50% 50%;
        }
        .spinner-ring {
            stroke: var(--bg3);
        }
        .spinner-fill {
            stroke: var(--accent);
            animation: spinner 2s linear infinite;
        }

        @keyframes spinner {
            0% {
                stroke-dasharray: 0.01px 43.97px;
                transform: rotate(0deg);
            }
            50% {
                transform: rotate(450deg);
                stroke-dasharray: 21.99px 21.99px;
            }
            100% {
                stroke-dasharray: 0.01px 43.97px;
                transform: rotate(1080deg);
            }
        }
    }
</style>