const ansyncHandler = (fn) => async(req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.status || 500).json({ 
        message: error.message,
        success: false
     });
  }
};

export { ansyncHandler };
