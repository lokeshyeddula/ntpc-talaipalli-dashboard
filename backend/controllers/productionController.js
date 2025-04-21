const path = require("path");
const { Production, Trips } = require("../models/productionModel");

const coalTripFactors = { 'Scania': 32, 'BB': 36, 'Eicher': 32 };
const OBTripFactors = {
    'Soft': { 'Scania': 16, 'Volvo': 16, 'BB': 16, 'Eicher': 13.7 },
    'Hard': { 'Scania': 18, 'Volvo': 18, 'BB': 16, 'Eicher': 14.4 }
};

exports.getProductionPage = (req, res) => {
    res.render('production', { title: 'Production' });
};

exports.getProductionData = async (req, res) => {
    try {
        const { date, pit, shift } = req.query;
        if (!date || !pit || !shift) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        const production_id = `${date}-${pit}-${shift}`;
        const existingProduction = await Production.findOne({ where: { id: production_id } });
        const trips = await Trips.findAll({ where: { production_id } });
        res.json({ 
            message: existingProduction ? "Existing record found." : "No existing record.",
            totalCoal: existingProduction?.totalCoal || 0,
            totalOB: existingProduction?.totalOB || 0,
            trips
        });
    } catch (error) {
        console.error("Error fetching production data:", error);
        res.status(500).json({ message: "Error fetching production data.", error });
    }
};

exports.addProductionEntry = async (req, res) => {
    try {
        const { date, pit, shift,rainfall, trips, remarks } = req.body;
        if (!date || !pit || !shift || !trips || trips.length === 0) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        let totalCoal = 0, totalOB = 0;
        const production_id = `${date}-${pit}-${shift}`;
        trips.forEach(trip => {
            if (trip.material === "Coal") {
                totalCoal += (trip.tripCount * (coalTripFactors[trip.vehicle] || 0));
            } else if (trip.material === "OB") {
                totalOB += (trip.tripCount * (OBTripFactors[trip.materialType]?.[trip.vehicle] || 0));
            }
        });
        const existingProduction = await Production.findOne({ where: { id: production_id } });
        let message;
        let stringifiedRemarks = typeof remarks === 'string' ? remarks : JSON.stringify(remarks);
        if (existingProduction) {
            await Production.update(
                { totalCoal, totalOB, rainfall,remarks },
                { where: { id: production_id } }
            );
            await Trips.destroy({ where: { production_id } });
            message = "Production data updated successfully!";
        } else {
            await Production.create({
                id: production_id,
                production_date: date,
                pit,
                shift,
                totalCoal,
                totalOB,
                rainfall,
                remarks: stringifiedRemarks
            });
            message = "New production entry saved successfully!";
        }
        for (const trip of trips) {
            await Trips.create({
                production_id,
                production_date: date,
                pit,
                shift,
                material: trip.material,
                materialType: trip.materialType || null,
                vehicle: trip.vehicle,
                destination: trip.material === "Coal" ? trip.destination : null,
                tripCount: trip.tripCount
            });
        }
        res.json({ message, totalCoal, totalOB });
    } catch (error) {
        console.error("Error saving production data:", error);
        res.status(500).json({ message: "Error saving production data.", error });
    }
};
