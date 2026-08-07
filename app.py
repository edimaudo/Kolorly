from flask import Flask, render_template

from config import Config


app = Flask(__name__)

app.config.from_object(Config)



@app.route("/")
def home():

    return render_template(
        "index.html"
    )




@app.route("/game")
def game():

    return render_template(
        "app.html"
    )




@app.route("/settings")
def settings():

    return render_template(
        "settings.html"
    )






if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
