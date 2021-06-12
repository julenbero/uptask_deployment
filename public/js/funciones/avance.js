import Swal from 'sweetalert2';

export const actualizarAvance = () => {
	//Seleccionar la stareas existentes
	const tareas = document.querySelectorAll('li.tarea');
	if (tareas.length) {
		//Seleccionar las tareas seleccionadas
		const tareasCompletadas = document.querySelectorAll('i.completo');
		//Calcular avance
		const avance = Math.round(tareasCompletadas.length / tareas.length * 100);
		//Mostar avance
		const porcentaje = document.querySelector('#porcentaje');
		porcentaje.style.width = avance + '%';
		if (avance === 100) {
			Swal.fire('Completaste el Proyecto', 'Felicidades has completado tus tareas', 'success');
		}
	}
};
