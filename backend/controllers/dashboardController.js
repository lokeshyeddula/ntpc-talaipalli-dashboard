const sequelize = require('../database');

exports.getProductionDashboardPage = async (req, res) => {
res.render("dashboard/production_dashboard", {title: "Production Dashboard"});
}

exports.getProductionDashboard = async (req, res) => {
    try {
        const [productionResults] = await sequelize.query(`
            SELECT 
    MONTH(CURRENT_DATE) AS current_month,
    YEAR(CURRENT_DATE) AS current_year,
    
    -- Monthly Coal and OB
    SUM(CASE 
            WHEN MONTH(PRODUCTION_DATE) = MONTH(CURRENT_DATE) 
            AND YEAR(PRODUCTION_DATE) = YEAR(CURRENT_DATE) 
         THEN TOTALCOAL ELSE 0 
    END) AS monthly_coal,
    
    SUM(CASE 
            WHEN MONTH(PRODUCTION_DATE) = MONTH(CURRENT_DATE) 
            AND YEAR(PRODUCTION_DATE) = YEAR(CURRENT_DATE) 
         THEN TOTALOB ELSE 0 
    END) AS monthly_ob,

    -- Financial Year Coal and OB (April 1st to March 31st)
    SUM(CASE 
            WHEN PRODUCTION_DATE >= MAKEDATE(YEAR(CURRENT_DATE), 1) + INTERVAL 3 MONTH 
            AND PRODUCTION_DATE < MAKEDATE(YEAR(CURRENT_DATE) + 1, 1) + INTERVAL 3 MONTH 
         THEN TOTALCOAL ELSE 0 
    END) AS yearly_coal,

    SUM(CASE 
            WHEN PRODUCTION_DATE >= MAKEDATE(YEAR(CURRENT_DATE), 1) + INTERVAL 3 MONTH 
            AND PRODUCTION_DATE < MAKEDATE(YEAR(CURRENT_DATE) + 1, 1) + INTERVAL 3 MONTH 
         THEN TOTALOB ELSE 0 
    END) AS yearly_ob,

    -- Inception Coal and OB
    SUM(TOTALCOAL) AS inception_coal,
    SUM(TOTALOB) AS inception_ob

FROM production;

        `);

        const [pitWiseYearlyCoalSinceInceptionResults] = await sequelize.query(`
            SELECT
                CASE
                    WHEN MONTH(production_date) >= 4 THEN
                        CONCAT('FY ', RIGHT(YEAR(production_date), 2), '-', RIGHT(YEAR(production_date) + 1, 2))
                    ELSE
                        CONCAT('FY ', RIGHT(YEAR(production_date) - 1, 2), '-', RIGHT(YEAR(production_date), 2))
                END AS financial_year,
                pit,
                SUM(totalcoal) AS yearly_total_coal,
                SUM(totalob) AS yearly_total_ob
            FROM production
            GROUP BY financial_year, pit
            ORDER BY financial_year, pit;
        `);
        const [monthlyCoalOBResults] = await sequelize.query(`
                   SELECT
                       CASE
                           WHEN MONTH(production_date) >= 4 THEN
                               CONCAT('FY ', RIGHT(YEAR(production_date), 2), '-', RIGHT(YEAR(production_date) + 1, 2))
                           ELSE
                               CONCAT('FY ', RIGHT(YEAR(production_date) - 1, 2), '-', RIGHT(YEAR(production_date), 2))
                       END AS financial_year,

                       MONTH(production_date) AS month_number,

                       DATE_FORMAT(production_date, '%M') AS month_name,

                       SUM(totalcoal) AS monthly_total_coal,
                       SUM(totalob) AS monthly_total_ob

                   FROM production

                   GROUP BY financial_year,
                            CASE
                                WHEN MONTH(production_date) >= 4 THEN MONTH(production_date)
                                ELSE MONTH(production_date) + 12
                            END,
                            month_number, month_name

                   ORDER BY financial_year,
                            CASE
                                WHEN MONTH(production_date) >= 4 THEN MONTH(production_date)
                                ELSE MONTH(production_date) + 12
                            END;

                `);


        res.json({
            ...productionResults[0],
            pitWiseCoal: pitWiseYearlyCoalSinceInceptionResults,
            monthlyCoalOB:monthlyCoalOBResults
        });
    } catch (error) {
        console.error("Error fetching production data:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
