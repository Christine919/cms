// Get sales dashboard data
export const getSalesData = async (req, res) => {
    try {
      // Fetch and process sales data
      res.json({ message: 'Sales data' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  