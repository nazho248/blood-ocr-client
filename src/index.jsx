import {render, useState} from 'react';
import { Upload, Loader } from 'lucide-react';

export default function BloodOCRApp() {
	const [selectedImage, setSelectedImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			setSelectedImage(reader.result);
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedImage) {
			setError("Por favor, selecciona una imagen");
			return;
		}

		setLoading(true);
		setError(null);
		setResult(null);

		try {
			// Obtener la parte base64 de la cadena dataURL
			const base64Data = selectedImage.split(',')[1];

			const response = await fetch('https://blood-ocr-303154388326.us-central1.run.app/ocr', {
				method: 'POST',
				headers: {
					'Authorization': 'OGLIT44458OCR32',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					archivo: base64Data,
					filetype: '.png'
				})
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			setResult(data);
		} catch (err) {
			setError(err.message || "Error al procesar la imagen");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
				<h1 className="text-2xl font-bold text-center mb-6">Análisis de Sangre OCR</h1>

				<div className="space-y-6">
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
						<label className="block mb-2">
							<div className="flex flex-col items-center justify-center cursor-pointer">
								<Upload className="w-12 h-12 text-gray-400 mb-2" />
								<span className="text-gray-600">Selecciona una imagen de análisis de sangre</span>
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleImageChange}
								/>
							</div>
						</label>

						{imagePreview && (
							<div className="mt-4">
								<img
									src={imagePreview}
									alt="Vista previa"
									className="mx-auto max-h-64 rounded"
								/>
							</div>
						)}
					</div>

					<button
						onClick={handleSubmit}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
						disabled={loading || !selectedImage}
					>
						{loading ? (
							<>
								<Loader className="w-5 h-5 mr-2 animate-spin" />
								Procesando...
							</>
						) : 'Analizar Imagen'}
					</button>
				</div>

				{error && (
					<div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
						<p className="font-medium">Error</p>
						<p>{error}</p>
					</div>
				)}

				{result && (
					<div className="mt-6 p-4 bg-gray-50 rounded-lg">
						<h2 className="text-xl font-semibold mb-3">Resultados del Análisis</h2>
						<pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
					</div>
				)}
			</div>
		</div>
	);
}
render(<BloodOCRApp />, document.getElementById('app'));