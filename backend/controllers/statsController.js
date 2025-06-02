const Stats = require('../models/statsModel');

exports.getAllStats = async (req, res) => {
    try {
        const stats = await Stats.getAll();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const stats = await Stats.getAll();

        const summary = {
            totalFunctions: stats.length,
            totalEvents: stats.reduce((sum, item) => sum + item.total_events, 0),
            totalBugs: stats.reduce((sum, item) => sum + item.total_bugs_found, 0),
            issueRate: (stats.reduce((sum, item) => sum + item.issue, 0) /
                stats.reduce((sum, item) => sum + item.da_check, 0) * 100).toFixed(2)
        };

        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};