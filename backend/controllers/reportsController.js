const sequelize = require('../database');

const fetchDailyPitWiseProduction = async (selectedDate) => {
    return sequelize.query(`
        SELECT 
            production_date,
            pit,
            SUM(totalcoal) AS daily_total_coal,
            SUM(totalob) AS daily_total_ob
        FROM production
        WHERE production_date = :selectedDate
        GROUP BY production_date, pit
        ORDER BY pit;
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { selectedDate }
    });
};

const fetchMonthlyPitWiseProduction = async (selectedDate) => {
    return sequelize.query(`
        SELECT 
            pit,
            SUM(totalcoal) AS monthly_total_coal,
            SUM(totalob) AS monthly_total_ob
        FROM production
        WHERE production_date >= DATE_FORMAT(:selectedDate, '%Y-%m-01')
          AND production_date <= :selectedDate
        GROUP BY pit
        ORDER BY pit;
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { selectedDate }
    });
};

const fetchYearlyPitWiseProduction = async (selectedDate) => {
    return sequelize.query(`
        SELECT
            CASE 
                WHEN MONTH(:selectedDate) >= 4 THEN 
                    CONCAT('FY ', YEAR(:selectedDate), '-', YEAR(:selectedDate) + 1)
                ELSE 
                    CONCAT('FY ', YEAR(:selectedDate) - 1, '-', YEAR(:selectedDate))
            END AS financial_year,
            pit,
            SUM(totalcoal) AS yearly_total_coal,
            SUM(totalob) AS yearly_total_ob
        FROM production
        WHERE production_date >= 
                CASE 
                    WHEN MONTH(:selectedDate) >= 4 THEN 
                        STR_TO_DATE(CONCAT(YEAR(:selectedDate), '-04-01'), '%Y-%m-%d')
                    ELSE 
                        STR_TO_DATE(CONCAT(YEAR(:selectedDate) - 1, '-04-01'), '%Y-%m-%d')
                END
          AND production_date <= :selectedDate
        GROUP BY financial_year, pit
        ORDER BY pit;
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { selectedDate }
    });
};

const fetchInceptionPitWiseProduction = async (selectedDate) => {
    return sequelize.query(`
        SELECT 
            pit,
            SUM(totalcoal) AS inception_total_coal,
            SUM(totalob) AS inception_total_ob
        FROM production
        WHERE production_date <= :selectedDate
        GROUP BY pit
        ORDER BY pit;
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { selectedDate }
    });
};

exports.getProductionPage = (req, res) => {
    res.render('reports', { title: 'Reports' });
};
exports.getReport = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "Date parameter is required." });
        }

        const [dailyData, monthlyData, yearlyData, inceptionData] = await Promise.all([
            fetchDailyPitWiseProduction(date),
            fetchMonthlyPitWiseProduction(date),
            fetchYearlyPitWiseProduction(date),
            fetchInceptionPitWiseProduction(date)
        ]);

        res.json({
            daily: dailyData,
            monthly: monthlyData,
            yearly: yearlyData,
            inception: inceptionData
        });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
