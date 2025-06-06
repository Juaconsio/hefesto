import express from 'express';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || ''
import {prioritizePassengers, Flight} from './models/flights' 

app.use(express.json());
app.use(cors())



// Example route
interface ApiResponse {
  message: string;
}


app.get('/', (_req: Request, res: Response<ApiResponse>) => {
  res.send({ message: 'Root' });
});

app.post('/api/flights', (req: Request, res: Response<ApiResponse>) => {
  const {capacity, flightCode, passengers} = req.body;
  console.log(capacity, flightCode, passengers)

  const newFlight = new Flight({ capacity, flightCode, passengers });

if (passengers.length > capacity) {
  const prioritized = prioritizePassengers(newFlight);
  newFlight.passengers = prioritized.slice(0, capacity); // Aseguras que no se pase
}

  res.status(200)
  res.send()

  // newFlight.save()
  //   .then(() => res.status(201).send({ message: 'Vuelo guardado exitosamente' }))
  //   .catch((error) => res.status(500).send({ message: 'Error guardando el vuelo: ' + error.message }));
});

app.get('/api/flights/overbooked-passengers', (_req: Request, res: Response<ApiResponse>) => {
  res.send({ message: 'Root' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
  });
