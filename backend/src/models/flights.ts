
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
id: { type: Number, required: true, unique: true },
name: { type: String, required: true },
hasConnections: { type: Boolean, required: true },
age: { type: Number, required: true },
flightCategory: { type: String, required: true },
reservationId: { type: String, required: true },
hasCheckedBaggage: { type: Boolean, required: true }
});

export const User = mongoose.model('User', userSchema);

const flightSchema = new mongoose.Schema({
capacity: { type: Number, required: true },
flightCode: { type: String, required: true },
passengers: { type: [User], required: true }
});

export const Flight = mongoose.model('Flight', flightSchema);


function hasOtherPassagersOnSamereservationId (flight:Flight, reservationId: string ) : boolean  {
     flight.passengers.map((passenger) => {
        if (passenger.reservationId === reservationId){
            return true
        }
     })
    return false
}

// Función para priorizar pasajeros en un vuelo
// Hay un error de los types, cries en typescript 
export function prioritizePassengers(flight: Flight): Passenger[] {
    flight.passengers.map((passenger) => {
        if (['Black', 'Platinum', 'Gold', 'Normal' ].includes(passenger.flightCategory)){
            switch (passenger.flightCategory) {
                case 'Black':
                    passenger.priority = 1;
                    break;
                case 'Platinum':
                    passenger.priority = 2;
                    break;
                case 'Gold':
                    passenger.priority = 3;
                    break;
                case 'Normal':
                    passenger.priority = 4;
                    break;
            }
        }
        if (passenger.hasConnections){
            passenger.priority = 5
        }
        if (hasOtherPassagersOnSamereservationId(flight, passenger.reservationId)){
            passenger.priority = 6
        }
    });
    
    return [...flight.passengers].sort((a, b) => {
    if (a.priority !== b.priority) {
            return a.priority - b.priority;
        }
     return a.age - b.age;
    });
}