import { LoadScript } from '@react-google-maps/api';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="App">
      <LoadScript googleMapsApiKey="AIzaSyApktDuyS7d_DUd8uIDZZeL5KauAlxlc-M" language="en">
        <AppRoutes />
      </LoadScript>
    </div>
  );
}

export default App;
