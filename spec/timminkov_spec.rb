require_relative "spec_helper"
require_relative "../timminkov.rb"

def app
  Timminkov
end

describe Timminkov do
  it "responds with a welcome message" do
    get '/'

    last_response.body.must_include 'Welcome to the Sinatra Template!'
  end
end
