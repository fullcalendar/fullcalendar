require "uri"
require "sass"

module Sass::Script::Functions

  def dataurl(image)
    imagepath = image.to_s.tr('\'"', '')
    text = File.open(imagepath, "r:UTF-8", &:read)
    Sass::Script::String.new("url('data:image/svg+xml," + URI::encode(text) + "')")
    # NOTE: we omit the utf8 text encoding statement because IE11 chokes. works fine without it
  end

  declare :dataurl, :args => [:string]

end
