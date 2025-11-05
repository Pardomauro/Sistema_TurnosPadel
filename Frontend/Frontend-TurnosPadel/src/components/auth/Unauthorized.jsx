import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg text-center">
            <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso No Autorizado</h2>
            <p className="text-gray-600 mb-6">
                No tienes permisos para acceder a esta página.
            </p>
            <Link 
                to="/canchas" 
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
                Volver al Inicio
            </Link>
        </div>
    );
};

export default Unauthorized;