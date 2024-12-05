from flask import Flask, request, send_file, jsonify
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
from PIL import Image
import io
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


MODEL_URL = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
model = hub.load(MODEL_URL)

@app.route('/nst', methods=['POST', 'OPTIONS'])
def style_transfer():
    try:
        # Check for content and style images in the request
        if 'content_image' not in request.files or 'style_image' not in request.files:
            return jsonify({"error": "Please upload both content and style images."}), 400

        content_image = request.files['content_image']
        style_image = request.files['style_image']
        
        # Preprocess images
        content = preprocess_image(content_image)
        style = preprocess_image(style_image)
        
        # Perform style transfer
        stylized_image = model(tf.constant(content), tf.constant(style))[0]
        
        # Convert the output tensor to a PIL Image
        stylized_image = convert_tensor_to_image(stylized_image)
        
        # Save the image to a BytesIO stream for sending
        img_io = io.BytesIO()
        stylized_image.save(img_io, format='PNG')
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def preprocess_image(image):
    """
    Preprocesses the input image for style transfer.
    - Resizes to 256x256.
    - Scales pixel values to [0, 1].
    - Ensures dtype is float32.
    """
    image = Image.open(image).convert("RGB")
    image = image.resize((256, 256))
    image = np.array(image) / 255.0
    image = image.astype(np.float32)  # Ensure dtype is float32
    return image[np.newaxis, ...]

def convert_tensor_to_image(tensor):
    """
    Converts a TensorFlow tensor to a PIL Image.
    """
    tensor = tensor.numpy()
    tensor = np.clip(tensor[0] * 255, 0, 255).astype('uint8')
    return Image.fromarray(tensor)

if __name__ == '__main__':
    app.run(debug=True)

